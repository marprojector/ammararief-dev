<?php
/**
 * GET /api/spotify.php
 * What Yasdil is playing on Spotify right now, plus the last few tracks played.
 *
 * Secrets live OUTSIDE public_html, in spotify-config.php beside it
 * (locally: one folder above the repo):
 *   <?php return [
 *     'client_id'     => '...',
 *     'client_secret' => '...',
 *     'refresh_token' => '...',   // from scripts/spotify-auth.mjs
 *   ];
 *
 * Response: { isPlaying: bool, now: Track|null, recent: Track[] }
 */

declare(strict_types=1);

ini_set('display_errors', '0'); // a PHP notice must never corrupt the JSON

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const CACHE_SECONDS = 30;

// Server: public_html/api → two levels up is the domain folder beside public_html.
// Local dev: public/api → two levels up is the repo itself, so also look one level higher (outside the repo).
$configFile = null;
foreach ([dirname(__DIR__, 2), dirname(__DIR__, 3)] as $dir) {
    if (is_file($dir . '/spotify-config.php')) {
        $configFile = $dir . '/spotify-config.php';
        break;
    }
}
$root = $configFile !== null ? dirname($configFile) : dirname(__DIR__, 2);
$cacheDir = $root . '/.spotify-cache';
$cacheFile = $cacheDir . '/response.json';
$tokenFile = $cacheDir . '/token.json';

function fail(int $status, string $error, ?string $stale = null): void
{
    // Spotify hiccup: an older answer beats an empty window.
    if ($stale !== null && is_file($stale)) {
        readfile($stale);
        exit;
    }
    http_response_code($status);
    echo json_encode(['error' => $error]);
    exit;
}

if ($configFile === null) {
    fail(503, 'not_configured');
}
$config = require $configFile;
if (!is_array($config)) {
    fail(503, 'not_configured');
}
foreach (['client_id', 'client_secret', 'refresh_token'] as $key) {
    if (empty($config[$key])) {
        fail(503, 'missing_' . $key); // e.g. missing_refresh_token
    }
}

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0700, true);
}
if (is_file($cacheFile) && time() - filemtime($cacheFile) < CACHE_SECONDS) {
    readfile($cacheFile);
    exit;
}

/** @return array{0:int,1:mixed} */
function request(string $method, string $url, array $headers, ?string $body = null): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 8,
    ]);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    $raw = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    return [$code, is_string($raw) && $raw !== '' ? json_decode($raw, true) : null];
}

function accessToken(array $c, string $file): ?string
{
    $saved = is_file($file) ? json_decode((string) file_get_contents($file), true) : null;
    if (is_array($saved) && ($saved['expires_at'] ?? 0) > time() + 60) {
        return $saved['access_token'];
    }
    [$code, $data] = request('POST', 'https://accounts.spotify.com/api/token', [
        'Authorization: Basic ' . base64_encode($c['client_id'] . ':' . $c['client_secret']),
        'Content-Type: application/x-www-form-urlencoded',
    ], http_build_query(['grant_type' => 'refresh_token', 'refresh_token' => $c['refresh_token']]));
    if ($code !== 200 || empty($data['access_token'])) {
        return null;
    }
    file_put_contents($file, json_encode([
        'access_token' => $data['access_token'],
        'expires_at' => time() + (int) ($data['expires_in'] ?? 3600),
    ]), LOCK_EX);
    return $data['access_token'];
}

function track(array $t): array
{
    $images = $t['album']['images'] ?? []; // largest first
    return [
        'id' => $t['id'] ?? '',
        'name' => $t['name'] ?? '',
        'artists' => array_map(fn ($a) => $a['name'] ?? '', $t['artists'] ?? []),
        'album' => $t['album']['name'] ?? '',
        'image' => $images[1]['url'] ?? $images[0]['url'] ?? null,
        'thumb' => $images ? $images[count($images) - 1]['url'] : null,
        'url' => $t['external_urls']['spotify'] ?? null,
        'durationMs' => (int) ($t['duration_ms'] ?? 0),
    ];
}

$token = accessToken($config, $tokenFile);
if ($token === null) {
    fail(502, 'token_refresh_failed', $cacheFile);
}
$auth = ['Authorization: Bearer ' . $token];
$out = ['isPlaying' => false, 'now' => null, 'recent' => []];

[$code, $now] = request('GET', 'https://api.spotify.com/v1/me/player/currently-playing', $auth);
if ($code === 200 && ($now['currently_playing_type'] ?? '') === 'track' && !empty($now['item'])) {
    $out['isPlaying'] = (bool) ($now['is_playing'] ?? false);
    $out['now'] = track($now['item']) + ['progressMs' => (int) ($now['progress_ms'] ?? 0)];
}

[$code, $recent] = request('GET', 'https://api.spotify.com/v1/me/player/recently-played?limit=12', $auth);
if ($code === 200) {
    $seen = [];
    foreach ($recent['items'] ?? [] as $item) {
        $t = track($item['track'] ?? []);
        if ($t['id'] === '' || isset($seen[$t['id']])) {
            continue; // the same song on repeat shows once
        }
        $seen[$t['id']] = true;
        $out['recent'][] = $t + ['playedAt' => $item['played_at'] ?? null];
        if (count($out['recent']) === 6) {
            break;
        }
    }
} elseif ($out['now'] === null) {
    // 403 here usually means the app owner's account has no active Premium plan (a Spotify rule for dev-mode apps).
    fail(502, $code === 403 ? 'spotify_forbidden_premium_required' : 'spotify_unavailable_' . $code, $cacheFile);
}

$json = json_encode($out, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
file_put_contents($cacheFile, $json, LOCK_EX);
echo $json;

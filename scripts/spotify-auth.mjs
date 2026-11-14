// One-time helper: gets the Spotify refresh token that public/api/spotify.php needs.
//
// 1. Create an app at https://developer.spotify.com/dashboard
//    and add this Redirect URI to it:  http://127.0.0.1:8888/callback
// 2. Run:  SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node scripts/spotify-auth.mjs
// 3. Open the printed link, approve, and copy the refresh token from the terminal.

import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'

const { SPOTIFY_CLIENT_ID: id, SPOTIFY_CLIENT_SECRET: secret } = process.env
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.')
  process.exit(1)
}

const REDIRECT = 'http://127.0.0.1:8888/callback'
const SCOPES = 'user-read-recently-played user-read-currently-playing'
const state = randomBytes(12).toString('hex')

const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({ response_type: 'code', client_id: id, scope: SCOPES, redirect_uri: REDIRECT, state })

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', REDIRECT)
  if (url.pathname !== '/callback') return res.writeHead(404).end()
  if (url.searchParams.get('state') !== state || !url.searchParams.get('code')) {
    res.writeHead(400).end('Authorization failed or was cancelled. Run the script again.')
    return
  }
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: REDIRECT }),
  })
  const data = await r.json()
  if (!r.ok || !data.refresh_token) {
    res.writeHead(500).end('Token exchange failed. See the terminal.')
    console.error('Spotify answered:', data)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done. You can close this tab and go back to the terminal.')
    console.log('\nRefresh token (put it in spotify-config.php):\n\n' + data.refresh_token + '\n')
  }
  server.close()
})

server.listen(8888, '127.0.0.1', () => {
  console.log('Open this link in your browser and approve access:\n\n' + authUrl + '\n')
})

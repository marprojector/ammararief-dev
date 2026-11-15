import { Helmet } from 'react-helmet-async'
import useVisitorTracker from '../hooks/useVisitorTracker'
import Desktop from '../components/desktop/Desktop'
import Welcome from '../components/desktop/Welcome'
import type { DataOverlay } from '../components/desktop/i18n'
import { useJson, type Profile, type Project, type StackData, type Social, type Work } from '../components/desktop/data'

const Landing = () => {
  useVisitorTracker('Landing')
  const profile = useJson<Profile>('/data/profile.json')
  const socials = useJson<Social[]>('/data/sosials.json')
  const projects = useJson<Project[]>('/data/projects.json')
  const work = useJson<Work[]>('/data/work.json')
  const stack = useJson<StackData>('/data/stack.json')
  const idOverlay = useJson<DataOverlay>('/data/i18n/id.json') // optional: Indonesian copy of the data
  const ready = profile && socials && projects && work && stack

  return (
    <>
      <Helmet>
        <title>M. Ammar R. Arief - Portfolio</title>
        <meta name="description" content="Software Engineer building web platforms, native desktop apps and local AI tooling with TypeScript, Rust and Swift." />
      </Helmet>
      {ready ? (
        <Desktop data={{ profile, socials, projects, work, stack }} overlay={idOverlay} />
      ) : (
        // The wallpaper is already painted by html/body in index.html, so nothing to show here.
        <div aria-busy="true" />
      )}
      <Welcome ready={!!ready} />
    </>
  )
}

export default Landing

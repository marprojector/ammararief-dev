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
        <title>Yasdil Lasoma - Portfolio</title>
        <meta name="description" content="Software Engineer who designs, builds and ships reliable web platforms with Laravel, NestJS, React and Vue." />
      </Helmet>
      {ready ? (
        <Desktop data={{ profile, socials, projects, work, stack }} overlay={idOverlay} />
      ) : (
        // Same ground colour as the wallpaper, so loading doesn't flash white.
        <div aria-busy="true" style={{ position: 'fixed', inset: 0, background: '#0b1640' }} />
      )}
      <Welcome ready={!!ready} />
    </>
  )
}

export default Landing

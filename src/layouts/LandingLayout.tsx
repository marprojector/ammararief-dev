import { Outlet } from 'react-router-dom'

// The landing page is a full-viewport desktop (see components/desktop), so the layout adds no frame.
const LandingLayout = () => <Outlet />

export default LandingLayout

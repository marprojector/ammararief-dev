import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingLayout from './layouts/LandingLayout'
import Landing from './pages/Landing'

// Everything but the landing desktop loads on demand, so visitors of the portfolio
// don't download the dashboard, the editor or the charts.
const BlogLayout = lazy(() => import('./layouts/BlogLayout'))
const Blog = lazy(() => import('./pages/Blog'))
const DetailBlog = lazy(() => import('./pages/DetailBlog'))
const AuthLayout = lazy(() => import('./layouts/AuthLayout'))
const Login = lazy(() => import('./pages/Login'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const BlogDashboard = lazy(() => import('./pages/Dashboard/Blog/Blog'))
const BlogForm = lazy(() => import('./pages/Dashboard/Blog/Form'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function App() {

  return (
    <Suspense fallback={null}>
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/blog" element={<BlogDashboard />} />
          <Route path="/dashboard/blog/create" element={<BlogForm />} />
          <Route path="/dashboard/blog/edit/:id" element={<BlogForm />} />

        </Route>
      </Route>

      <Route element={<BlogLayout />}>
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<DetailBlog />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </Suspense>
  )
}

export default App

import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '../components/StateMessages'
import { useSession } from './auth'

/** Gates a route behind a signed-in session, preserving the attempted path. */
export function RequireSession() {
  const { data, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <LoadingState label="Checking session…" />
  if (!data?.user) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }
  return <Outlet />
}

/** Gates a route behind the Hotel Management role. Anonymous visitors go to
 *  login; signed-in guests go home. Business numbers never leak. */
export function RequireManagement() {
  const { data, isPending } = useSession()
  const location = useLocation()

  if (isPending) return <LoadingState label="Checking session…" />
  if (!data?.user) {
    const redirect = `${location.pathname}${location.search}`
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }
  if (data.user.role !== 'management') {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

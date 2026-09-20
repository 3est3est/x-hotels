import { Hotel, LogOut, UserPlus } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { authClient, useSession } from './lib/auth'

function SessionNav() {
  const { data, isPending } = useSession()
  const navigate = useNavigate()

  if (isPending) {
    return <span className="text-sm text-neutral-400">Loading…</span>
  }

  const user = data?.user
  if (!user) {
    return (
      <nav className="flex items-center gap-3">
        <NavLink to="/login" className="text-sm hover:text-white">
          Sign in
        </NavLink>
        <NavLink
          to="/register"
          className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          <UserPlus size={16} aria-hidden /> Register
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      <NavLink to="/bookings" className="text-sm hover:text-white">
        My bookings
      </NavLink>
      {!user.verifiedAt && (
        <NavLink to="/verify" className="text-sm hover:text-white">
          Verify identity
        </NavLink>
      )}
      <span className="text-sm text-neutral-400">{user.email}</span>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm hover:text-white"
        onClick={async () => {
          await authClient.signOut()
          navigate('/')
        }}
      >
        <LogOut size={16} aria-hidden /> Sign out
      </button>
    </nav>
  )
}

function App() {
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold">
            <Hotel size={22} aria-hidden />
            X Hotels
          </NavLink>
          <SessionNav />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App

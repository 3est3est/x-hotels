import { LogOut } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { authClient, useSession } from './lib/auth'
import { Button } from './components/ui/button'
import { cn } from './lib/utils'

/* Shape rule for the whole app: pill buttons, 16px cards, 12px inputs.
   One light theme only. Gold is the single accent (primary actions, active
   states, rating star); muted olive/slate appear solely in status pills. */

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition hover:text-ink',
    isActive ? 'text-ink underline decoration-gold decoration-2 underline-offset-4' : 'text-stone',
  )

function SessionNav() {
  const { data, isPending } = useSession()
  const navigate = useNavigate()

  if (isPending) {
    return <span className="text-sm text-faint">Loading…</span>
  }

  const user = data?.user
  if (!user) {
    return (
      <nav className="flex items-center gap-5">
        <NavLink to="/login" className={linkClass}>
          Sign in
        </NavLink>
        <Button asChild variant="primary">
          <NavLink to="/register">Register</NavLink>
        </Button>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-5">
      <NavLink to="/bookings" className={linkClass}>
        My bookings
      </NavLink>
      {user.role === 'management' && (
        <NavLink to="/management" className={linkClass}>
          Dashboard
        </NavLink>
      )}
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
      <span className="hidden max-w-44 truncate text-sm text-faint sm:inline">{user.email}</span>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm font-medium text-stone transition hover:text-ink"
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
    <div className="flex min-h-dvh flex-col bg-paper font-sans text-ink">
      <header className="border-b border-hairline bg-card">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-4 sm:px-6">
          <NavLink to="/" className="font-display text-[26px] font-semibold tracking-tight">
            X Hotels
          </NavLink>
          <SessionNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-display text-lg font-semibold text-stone">X Hotels</span>
          <span>On-site payment at every branch. No online prepayment.</span>
        </div>
      </footer>
    </div>
  )
}

export default App

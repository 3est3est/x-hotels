import { LogOut, UserPlus } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { authClient, useSession } from './lib/auth'

/* Shape rule for the whole app: pill buttons, 16px cards, 12px inputs.
   One light theme only. Ink is the single accent; muted olive/slate appear
   solely in booking-status pills. */

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
        <NavLink to="/login" className="text-sm font-medium text-stone hover:text-ink">
          Sign in
        </NavLink>
        <NavLink
          to="/register"
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 active:scale-[0.98]"
        >
          <UserPlus size={16} aria-hidden /> Register
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-5">
      <NavLink to="/bookings" className="text-sm font-medium text-stone hover:text-ink">
        My bookings
      </NavLink>
      {!user.verifiedAt && (
        <NavLink to="/verify" className="text-sm font-medium text-stone hover:text-ink">
          Verify identity
        </NavLink>
      )}
      <span className="hidden max-w-44 truncate text-sm text-faint sm:inline">{user.email}</span>
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm font-medium text-stone hover:text-ink"
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

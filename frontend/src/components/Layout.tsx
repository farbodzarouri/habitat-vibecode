import { NavLink, Outlet } from 'react-router-dom'
import { useStore } from '../store'

const nav = [
  { to: '/', label: 'Dashboard', icon: 'M3 12l7-8 7 8M5 10v7h4v-4h2v4h4v-7', end: true },
  { to: '/employees', label: 'Employees', icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zM4 17c0-3 2.7-5 6-5s6 2 6 5' },
  { to: '/stock', label: 'Stock', icon: 'M3 6l7-3 7 3v8l-7 3-7-3V6zM3 6l7 3m0 0l7-3m-7 3v8' },
  { to: '/orders', label: 'Orders', icon: 'M5 3h8l3 3v11H5V3zM8 9h6M8 12h6' },
  { to: '/customers', label: 'Customers', icon: 'M7 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2 16c0-2.5 2.2-4 5-4s5 1.5 5 4M12 12.5c2.3.3 4 1.6 4 3.5' },
]

export function Layout() {
  const { currentUser, logout, apiConnected } = useStore()
  if (!currentUser) return null
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-52 flex-col bg-cocoa-800 text-cream">
        <div className="px-4 pb-3 pt-5">
          <div className="flex h-14 items-center justify-center overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Valentein Chocolate"
              className="w-40 scale-[1.6] invert mix-blend-screen"
            />
          </div>
          <div className="mt-1 text-center text-[11px] text-cream/60">Internal tools</div>
        </div>
        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-cocoa-600 font-medium text-white' : 'text-cream/75 hover:bg-cocoa-700 hover:text-cream'
                }`
              }
            >
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-2 border-t border-cocoa-700 px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{currentUser.username}</div>
            <div className="text-[11px] text-cream/60">
              {currentUser.role} · {apiConnected ? 'live API' : 'mock data'}
            </div>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-cream/70 hover:bg-cocoa-700 hover:text-cream"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="ml-52 flex-1 px-6 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

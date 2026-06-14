import { useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'

const NAV_LINKS = [
  { to: '/', label: 'Books', emoji: '📚', match: (p: string) => p === '/' || p.startsWith('/books') },
  { to: '/authors', label: 'Authors', emoji: '✍️', match: (p: string) => p.startsWith('/authors') },
  { to: '/categories', label: 'Categories', emoji: '🏷️', match: (p: string) => p.startsWith('/categories') },
  { to: '/dashboard', label: 'Dashboard', emoji: '📊', match: (p: string) => p.startsWith('/dashboard') },
]

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark')
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-violet-50 to-rose-100">
      <Navbar isBlurred isBordered={false} classNames={{ wrapper: 'max-w-5xl' }}>
        <NavbarBrand>
          <Link to="/" className="font-bold text-xl text-violet-700 tracking-tight">Bookmarker</Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-1" justify="center">
          {NAV_LINKS.map(link => (
            <NavbarItem key={link.to} isActive={link.match(pathname)}>
              <Link
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  link.match(pathname) ? 'text-violet-700 bg-violet-100' : 'text-default-600 hover:text-violet-700'
                }`}
              >
                {link.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <NavbarItem>
            <Button size="sm" variant="light" isIconOnly onPress={toggleDark} aria-label="Toggle dark mode">
              {dark ? '☀️' : '🌙'}
            </Button>
          </NavbarItem>
          {user && (
            <>
              <NavbarItem className="hidden sm:flex">
                <span className="text-xs text-default-500 font-medium">{user.username}</span>
              </NavbarItem>
              <NavbarItem>
                <Button size="sm" variant="light" color="danger" onPress={handleLogout} className="hidden sm:flex">
                  Logout
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-default-100">
        <div className="flex h-14">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                link.match(pathname) ? 'text-violet-700' : 'text-default-400'
              }`}
            >
              <span className="text-lg leading-none">{link.emoji}</span>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
          <button
            onClick={toggleDark}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-default-400"
          >
            <span className="text-lg leading-none">{dark ? '☀️' : '🌙'}</span>
            <span className="text-[10px] font-medium">{dark ? 'Light' : 'Dark'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-danger"
          >
            <span className="text-lg leading-none">🚪</span>
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

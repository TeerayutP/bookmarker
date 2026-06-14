import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, User } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'

const NAV_LINKS = [
  { to: '/', label: 'Books', match: (p: string) => p === '/' || p.startsWith('/books') },
  { to: '/authors', label: 'Authors', match: (p: string) => p.startsWith('/authors') },
  { to: '/categories', label: 'Categories', match: (p: string) => p.startsWith('/categories') },
]

const ADD_LINK: Record<string, string> = {
  '/': '/books/new',
  '/authors': '/authors/new',
  '/categories': '/categories/new',
}

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)

  const addHref = Object.entries(ADD_LINK).find(([prefix]) =>
    prefix === '/' ? pathname === '/' || pathname.startsWith('/books') : pathname.startsWith(prefix)
  )?.[1] ?? '/books/new'

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
            <Button as={Link} to={addHref} color="secondary" variant="flat" size="sm">+ Add</Button>
          </NavbarItem>
          {user && (
            <NavbarItem className="flex items-center gap-2">
              <User
                name={user.username}
                description={user.email}
                classNames={{ name: 'text-xs font-medium', description: 'text-xs' }}
              />
              <Button size="sm" variant="light" color="danger" onPress={handleLogout}>
                Logout
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

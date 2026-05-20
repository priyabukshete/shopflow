import { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ArrowLeftRight, BarChart3, LogOut,
  Moon, Sun, ShoppingBag, Users, Languages, ClipboardList,
  Menu, X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

interface AppLayoutProps {
  children: ReactNode
}

const navigationConfig = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'pos',       path: '/pos',       icon: ShoppingBag },
  { key: 'orders',    path: '/orders',    icon: ClipboardList },
  { key: 'products',  path: '/products',  icon: Package },
  { key: 'stock',     path: '/stock',     icon: ArrowLeftRight },
  { key: 'reports',   path: '/reports',   icon: BarChart3 },
  { key: 'users',     path: '/users',     icon: Users },
]

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const location = useLocation()

  // Sidebar open/closed state — only matters on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-close sidebar when route changes (so tapping a menu item closes it on mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile hamburger button — only visible below md */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-current/5 hover:bg-current/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop — only on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0
          w-64 h-screen z-50
          border-r border-current/10
          flex flex-col overflow-y-auto
          bg-[var(--color-bg,#fdfbf6)]
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 rounded-md hover:bg-current/5"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="p-8 border-b border-current/10">
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-serif)' }}>
            ShopFlow
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted mt-1">
            {t('common.swissRetail')}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {navigationConfig.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-md transition-all text-sm ${
                  isActive
                    ? 'nav-active font-medium'
                    : 'hover:bg-current/5 text-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}
        </nav>

        {/* User info + actions */}
        <div className="p-4 border-t border-current/10">
          <div className="mb-3 px-2">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted">{user?.role}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={toggleLanguage}
              className="flex-1 flex items-center justify-center gap-1 p-2 rounded-md hover:bg-current/5 transition-colors text-xs uppercase tracking-wider"
              title="Toggle language"
            >
              <Languages className="w-4 h-4" />
              {i18n.language === 'de' ? 'DE' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center p-2 rounded-md hover:bg-current/5 transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center p-2 rounded-md hover:bg-current/5 transition-colors"
              title={t('common.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen p-4 pt-16 md:p-8 md:pt-8 w-full md:w-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
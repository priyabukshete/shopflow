import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Loader2, Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/authApi'

export function LoginPage() {

  const demoAccounts = [
    {
      label: 'Manager',
      email: 'demo.manager@shopflow.ch',
      password: 'demo@123',
      description: 'Full access except user management',
    },
    {
      label: 'Cashier',
      email: 'demo.cashier@shopflow.ch',
      password: 'demo@123',
      description: 'POS & orders only',
    },
  ]

  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de'
    i18n.changeLanguage(newLang)
  }

  const fillDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await authApi.login({ email, password })
      login(response.token, response.email, response.fullName, response.role)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || t('login.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 relative">
      {/* Top right controls */}
      <div className="absolute top-6 right-6 flex gap-2">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-xs uppercase tracking-wider"
        >
          <Languages className="w-4 h-4" />
          {i18n.language === 'de' ? 'DE' : 'EN'}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('login.title')}
          </h1>
          <div className="h-px w-12 mx-auto my-4 bg-current opacity-20" />
          <p className="text-muted text-sm uppercase tracking-widest">
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">
              {t('login.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none transition-colors"
              placeholder="priya.bukshete@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-8 border border-current/30 hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all uppercase text-xs tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('login.signingIn')}
              </>
            ) : (
              t('login.signIn')
            )}
          </button>
        </form>

        {/* Demo credentials box for recruiters */}
        <div className="mt-6 p-4 border border-[var(--color-gold)]/30 rounded-lg bg-[var(--color-gold)]/5">
          <p className="text-xs uppercase tracking-widest text-center text-muted mb-1">
            🎭 {t('login.tryDemo', 'Try the demo')}
          </p>
          <p className="text-xs text-center text-muted mb-4 opacity-70">
            {t('login.tryDemoHint', 'Click a role to auto-fill credentials')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => fillDemoCredentials(account.email, account.password)}
                className="p-3 border border-current/15 rounded-md hover:border-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 transition-all text-left group"
              >
                <p
                  className="text-sm font-medium mb-1"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {account.label}
                </p>
                <p className="text-[10px] text-muted leading-tight">
                  {account.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-muted text-xs mt-6">
          <p className="mb-1">© 2026 ShopFlow</p>
          <div className="h-px w-8 bg-current opacity-20 mx-auto my-2" />
          <p className="uppercase tracking-widest" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('login.craftedBy')}
          </p>
          <p className="mt-1">{t('login.madeIn')} 🇨🇭</p>
        </div>
      </div>
    </div>
  )
}
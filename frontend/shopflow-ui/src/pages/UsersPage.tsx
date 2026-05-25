import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, X, Search, Shield, ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { userApi } from '../api/userApi'
import type { RegisterUserRequest } from '../types/user'

export function UsersPage() {
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const queryClient = useQueryClient()

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
  })

  const addUserMutation = useMutation({
    mutationFn: userApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowAddUser(false)
    },
  })

  const setStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userApi.setStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })

  const filteredUsers = users?.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  }) ?? []

  const stats = {
    total: users?.length ?? 0,
    active: users?.filter(u => u.isActive).length ?? 0,
    inactive: users?.filter(u => !u.isActive).length ?? 0,
  }

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('users.title')}
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted">
            {t('users.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="px-4 py-2 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest inline-flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {t('users.newUser')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('users.totalUsers')}</p>
            <Users className="w-4 h-4 text-muted" />
          </div>
          <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>{stats.total}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('common.active')}</p>
            <div className="p-2 rounded-md text-success bg-success-soft">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-4xl text-success" style={{ fontFamily: 'var(--font-serif)' }}>{stats.active}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('common.inactive')}</p>
            <div className="p-2 rounded-md text-warning bg-warning-soft">
              <ShieldOff className="w-4 h-4" />
            </div>
          </div>
          <p className="text-4xl text-warning" style={{ fontFamily: 'var(--font-serif)' }}>{stats.inactive}</p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('users.allUsers')}
          </h3>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm cursor-pointer"
              style={{ background: 'var(--bg-modal)' }}
            >
              <option value="all">{t('users.allRoles')}</option>
              <option value="Admin">{t('users.admin')}</option>
              <option value="Manager">{t('users.manager')}</option>
              <option value="Cashier">{t('users.cashier')}</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('users.searchPlaceholder') ?? `${t('common.search')} ${t('common.name')}...`}
                className="pl-10 pr-4 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm w-64"
              />
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <p className="text-center text-muted py-12">{t('common.loading')}</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-3">
            <table className="w-full min-w-[700px]">
              <thead className="sticky top-0 bg-[var(--color-cream)] dark:bg-[var(--color-ink)] z-10">
                <tr className="border-b border-current/10">
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('common.name')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('users.email')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('users.role')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('users.joined')}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted py-3">{t('common.status')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const roleColors: Record<string, string> = {
                    Admin: 'bg-info-soft text-info',
                    Manager: 'bg-success-soft text-success',
                    Cashier: 'bg-current/5 text-muted',
                  }
                  const roleColor = roleColors[u.role] ?? 'bg-current/5 text-muted'

                  return (
                    <tr key={u.id} className="border-b border-current/5 hover:bg-current/[0.02]">
                      <td className="py-4 font-medium">{u.firstName} {u.lastName}</td>
                      <td className="py-4 text-sm text-muted">{u.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${roleColor}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-muted">
                        {new Date(u.createdAt).toLocaleDateString(locale, {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 text-center">
                        {u.isActive ? (
                          <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-success-soft text-success">
                            {t('common.active')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-warning-soft text-warning">
                            {t('common.inactive')}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => setStatusMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                          disabled={setStatusMutation.isPending}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs text-muted hover:text-current border border-current/20 hover:border-[var(--color-gold)] rounded transition-all disabled:opacity-50"
                        >
                          {u.isActive ? (
                            <>
                              <ShieldOff className="w-3 h-3" />
                              {t('users.deactivate')}
                            </>
                          ) : (
                            <>
                              <Shield className="w-3 h-3" />
                              {t('users.activate')}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddUser && (
        <AddUserModal
          isLoading={addUserMutation.isPending}
          onSubmit={(data) => addUserMutation.mutate(data)}
          onClose={() => setShowAddUser(false)}
        />
      )}
    </div>
  )
}

function AddUserModal({ isLoading, onSubmit, onClose }: {
  isLoading: boolean
  onSubmit: (data: RegisterUserRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Cashier')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ firstName, lastName, email, password, role })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="p-8 max-w-lg w-full rounded-xl border border-current/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('users.newUser')}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {t('users.addStaff')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('users.firstName')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="Anna"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('users.lastName')}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="Müller"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('users.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              placeholder="anna.muller@shopflow.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('users.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('users.role')}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            >
              <option value="Cashier">{t('users.cashierDesc')}</option>
              <option value="Manager">{t('users.managerDesc')}</option>
              <option value="Admin">{t('users.adminDesc')}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('users.creating') : t('users.createUser')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
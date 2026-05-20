import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Package, AlertTriangle, ShoppingCart, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '../api/inventoryApi'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  
  const { data: report, isLoading } = useQuery({
    queryKey: ['daily-report'],
    queryFn: () => inventoryApi.getDailyReport(),
  })

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryApi.getProducts,
  })

  const [searchTerm, setSearchTerm] = useState('')

  const totalProducts = products?.length ?? 0
  const lowStockCount = products?.filter(p => p.isLowStock).length ?? 0
  const totalSoldToday = report?.products.reduce((sum, p) => sum + p.sold, 0) ?? 0
  const totalDeliveredToday = report?.products.reduce((sum, p) => sum + p.delivered, 0) ?? 0

  if (isLoading) {
    return <div className="text-center text-muted py-20">{t('common.loading')}</div>
  }

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('dashboard.title')}
        </h2>
        <p className="text-xs uppercase tracking-widest text-muted">
          {new Date().toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Package} label={t('dashboard.totalProducts')} value={totalProducts} accentColor="navy" />
        <StatCard icon={ShoppingCart} label={t('dashboard.soldToday')} value={totalSoldToday} accentColor="terra" />
        <StatCard icon={TrendingUp} label={t('dashboard.deliveredToday')} value={totalDeliveredToday} accentColor="sage" />
        <StatCard
          icon={AlertTriangle}
          label={t('dashboard.lowStock')}
          value={lowStockCount}
          accentColor="gold"
          highlight={lowStockCount > 0}
          highlightText={t('dashboard.needsAttention')}
        />
      </div>

      {/* Daily movements table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('dashboard.todaysActivity')}
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('dashboard.searchProducts')}
              className="pl-10 pr-4 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm w-64"
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-current/10">
              <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.product')}</th>
              <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.delivered')}</th>
              <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.produced')}</th>
              <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.sold')}</th>
              <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.wasted')}</th>
              <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.inStock')}</th>
            </tr>
          </thead>
          <tbody>
            {report?.products
              .filter(p => p.productName.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(p => (
                <tr key={p.productId} className="border-b border-current/5 hover:bg-current/[0.02]">
                  <td className="py-4 font-medium">{p.productName}</td>
                  <td className="text-right text-success">{p.delivered > 0 ? `+${p.delivered}` : '—'}</td>
                  <td className="text-right text-info">{p.produced > 0 ? `+${p.produced}` : '—'}</td>
                  <td className="text-right text-warning">{p.sold > 0 ? `-${p.sold}` : '—'}</td>
                  <td className="text-right" style={{ color: 'var(--color-terra)', opacity: 0.7 }}>
                    {p.wasted > 0 ? `-${p.wasted}` : '—'}
                  </td>
                  <td className="text-right font-medium">{p.currentStock}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {report && report.products.length === 0 && (
          <p className="text-center text-muted py-8">{t('dashboard.noProducts')}</p>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  accentColor: 'gold' | 'sage' | 'terra' | 'navy'
  highlight?: boolean
  highlightText?: string
}

function StatCard({ icon: Icon, label, value, accentColor, highlight, highlightText }: StatCardProps) {
  const colorMap = {
    gold: 'text-info bg-info-soft',
    sage: 'text-success bg-success-soft',
    terra: 'text-warning bg-warning-soft',
    navy: 'text-muted bg-current/5',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <div className={`p-2 rounded-md ${colorMap[accentColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </p>
      {highlight && value > 0 && highlightText && (
        <p className="text-xs mt-2 text-warning">⚠ {highlightText}</p>
      )}
    </div>
  )
}
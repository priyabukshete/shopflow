import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, TrendingUp, ShoppingCart, AlertCircle, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts'
import { inventoryApi } from '../api/inventoryApi'

export function ReportsPage() {
  const { t, i18n } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: report, isLoading } = useQuery({
    queryKey: ['daily-report', selectedDate],
    queryFn: () => inventoryApi.getDailyReport(selectedDate),
  })

  const { data: recentMovements } = useQuery({
    queryKey: ['recent-movements-100'],
    queryFn: () => inventoryApi.getRecentMovements(100),
  })

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const fromDate = sevenDaysAgo.toISOString().split('T')[0]
  const toDate = new Date().toISOString().split('T')[0]

  const { data: rangeReports } = useQuery({
    queryKey: ['range-report', fromDate, toDate],
    queryFn: () => inventoryApi.getReportRange(fromDate, toDate),
  })

  const totalSold = report?.products.reduce((sum, p) => sum + p.sold, 0) ?? 0
  const totalDelivered = report?.products.reduce((sum, p) => sum + p.delivered, 0) ?? 0
  const totalProduced = report?.products.reduce((sum, p) => sum + p.produced, 0) ?? 0
  const totalWasted = report?.products.reduce((sum, p) => sum + p.wasted, 0) ?? 0

  const topSellers = (report?.products ?? [])
    .filter(p => p.sold > 0)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map(p => ({ name: p.productName, sold: p.sold }))

  const movementBreakdown = (() => {
    if (!recentMovements) return []
    const counts: Record<string, number> = {}
    recentMovements.forEach(m => {
      counts[m.type] = (counts[m.type] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  })()

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  const sevenDayTrend = (rangeReports ?? []).map(r => {
    const date = new Date(r.date)
    return {
      day: date.toLocaleDateString(locale, { weekday: 'short', day: '2-digit' }),
      [t('dashboard.sold')]:      r.products.reduce((sum, p) => sum + p.sold, 0),
      [t('dashboard.delivered')]: r.products.reduce((sum, p) => sum + p.delivered, 0),
      [t('dashboard.produced')]:  r.products.reduce((sum, p) => sum + p.produced, 0),
      [t('dashboard.wasted')]:    r.products.reduce((sum, p) => sum + p.wasted, 0),
    }
  })

  const SWISS_COLORS = ['#B8954A', '#7B8B6F', '#C97B5E', '#2D3548', '#9A8B7A', '#6B5D52']
  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('reports.title')}
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted">
            {t('reports.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm"
            style={{ background: 'var(--bg-modal)' }}
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-muted py-20">{t('common.loading')}</p>
      ) : (
        <>
          <div className="mb-2">
            <p className="text-sm text-muted">
              {t('reports.dailySummary')} <strong>{new Date(selectedDate).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              {isToday && <span className="ml-2 px-2 py-0.5 rounded text-xs bg-info-soft text-info">{t('common.today')}</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-3">
            <SummaryCard icon={TrendingUp} label={t('dashboard.delivered')} value={totalDelivered} color="sage" />
            <SummaryCard icon={Package} label={t('dashboard.produced')} value={totalProduced} color="gold" />
            <SummaryCard icon={ShoppingCart} label={t('dashboard.sold')} value={totalSold} color="navy" />
            <SummaryCard icon={AlertCircle} label={t('dashboard.wasted')} value={totalWasted} color="terra" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="card p-6">
              <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('reports.topSellers')}
              </h3>
              <p className="text-xs text-muted mb-4">
                {t('reports.topSellersDesc')}
              </p>
              {topSellers.length === 0 ? (
                <p className="text-center text-muted py-12">{t('reports.noSales')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={topSellers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis type="number" stroke="currentColor" opacity={0.5} fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="currentColor" opacity={0.7} fontSize={12} width={120} />
                    <Tooltip contentStyle={{ background: 'var(--bg-modal)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                    <Bar dataKey="sold" fill="#B8954A" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('reports.movementDistribution')}
              </h3>
              <p className="text-xs text-muted mb-4">
                {t('reports.movementDistributionDesc')}
              </p>
              {movementBreakdown.length === 0 ? (
                <p className="text-center text-muted py-12">{t('stock.noMovements')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={movementBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {movementBreakdown.map((_, index) => (
                        // @ts-ignore - Cell is deprecated but still works
                        <Cell key={`cell-${index}`} fill={SWISS_COLORS[index % SWISS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-modal)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('reports.sevenDayTrend')}
            </h3>
            <p className="text-xs text-muted mb-6">
              {t('reports.sevenDayDesc')}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sevenDayTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" stroke="currentColor" opacity={0.7} fontSize={12} />
                <YAxis stroke="currentColor" opacity={0.7} fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-modal)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey={t('dashboard.sold')}      stroke="#2D3548" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={t('dashboard.delivered')} stroke="#7B8B6F" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={t('dashboard.produced')}  stroke="#B8954A" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey={t('dashboard.wasted')}    stroke="#C97B5E" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {!isToday && (
            <div className="card p-6 mt-6">
              <h3 className="text-xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                {t('reports.perProductBreakdown')}
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-current/10">
                    <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.product')}</th>
                    <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.delivered')}</th>
                    <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.produced')}</th>
                    <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.sold')}</th>
                    <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.wasted')}</th>
                    <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('reports.returned')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.products.map(p => (
                    <tr key={p.productId} className="border-b border-current/5 hover:bg-current/[0.02]">
                      <td className="py-3 font-medium">{p.productName}</td>
                      <td className="py-3 text-right text-success">{p.delivered || '—'}</td>
                      <td className="py-3 text-right text-info">{p.produced || '—'}</td>
                      <td className="py-3 text-right text-muted">{p.sold || '—'}</td>
                      <td className="py-3 text-right text-warning">{p.wasted || '—'}</td>
                      <td className="py-3 text-right text-muted">{p.returned || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report && report.products.every(p => p.sold === 0 && p.delivered === 0 && p.produced === 0 && p.wasted === 0 && p.returned === 0) && (
                <p className="text-center text-muted py-8">{t('stock.noMovements')}</p>
              )}
            </div>
          )}

          {isToday && (
            <div className="card p-6 mt-6 bg-current/[0.02] text-center">
              <p className="text-sm text-muted">
                💡 {t('reports.todayBreakdownNotice')}
                <br />{t('reports.changeDateNotice')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }: { 
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'gold' | 'sage' | 'terra' | 'navy'
}) {
  const colorMap = {
    gold:  'text-info bg-info-soft',
    sage:  'text-success bg-success-soft',
    terra: 'text-warning bg-warning-soft',
    navy:  'text-muted bg-current/5',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <div className={`p-2 rounded-md ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>{value}</p>
    </div>
  )
}
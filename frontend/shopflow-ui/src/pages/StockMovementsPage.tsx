import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Truck, Wheat, ShoppingCart, Trash2, RotateCcw, X, History, Wrench, Search, Filter } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '../api/inventoryApi'
import type { RecordMovementRequest } from '../api/inventoryApi'
import type { StockMovement } from '../types/inventory'

type MovementType = 'delivery' | 'production' | 'sale' | 'waste' | 'return' | 'adjustment'

interface MovementOption {
  type: MovementType
  labelKey: string
  descKey: string
  icon: React.ComponentType<{ className?: string }>
  color: 'sage' | 'gold' | 'terra' | 'navy'
}

const movementOptions: MovementOption[] = [
  { type: 'delivery',   labelKey: 'stock.delivery',   descKey: 'stock.deliveryDesc',   icon: Truck,        color: 'sage'  },
  { type: 'production', labelKey: 'stock.production', descKey: 'stock.productionDesc', icon: Wheat,        color: 'gold'  },
  { type: 'sale',       labelKey: 'stock.sale',       descKey: 'stock.saleDesc',       icon: ShoppingCart, color: 'navy'  },
  { type: 'waste',      labelKey: 'stock.waste',      descKey: 'stock.wasteDesc',      icon: Trash2,       color: 'terra' },
  { type: 'return',     labelKey: 'stock.return',     descKey: 'stock.returnDesc',     icon: RotateCcw,    color: 'navy'  },
]

export function StockMovementsPage() {
  const { t, i18n } = useTranslation()
  const [selectedType, setSelectedType] = useState<MovementType | null>(null)
  const [adjustingMovement, setAdjustingMovement] = useState<StockMovement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const queryClient = useQueryClient()

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryApi.getProducts,
  })

  const { data: recentMovements } = useQuery({
    queryKey: ['recent-movements'],
    queryFn: () => inventoryApi.getRecentMovements(20),
  })

  const mutation = useMutation({
    mutationFn: async (data: { type: MovementType; payload: RecordMovementRequest }) => {
      switch (data.type) {
        case 'delivery':   return inventoryApi.recordDelivery(data.payload)
        case 'production': return inventoryApi.recordProduction(data.payload)
        case 'sale':       return inventoryApi.recordSale(data.payload)
        case 'waste':      return inventoryApi.recordWaste(data.payload)
        case 'return':     return inventoryApi.recordReturn(data.payload)
        case 'adjustment': return inventoryApi.recordAdjustment(data.payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['daily-report'] })
      queryClient.invalidateQueries({ queryKey: ['recent-movements'] })
      setSelectedType(null)
      setAdjustingMovement(null)
    },
  })

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('stock.title')}
        </h2>
        <p className="text-xs uppercase tracking-widest text-muted">
          {t('stock.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {movementOptions.map((option) => {
          const Icon = option.icon
          const colorMap = {
            sage:  'text-success bg-success-soft',
            gold:  'text-info bg-info-soft',
            terra: 'text-warning bg-warning-soft',
            navy:  'text-muted bg-current/5',
          }

          return (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className="card p-6 text-left group"
            >
              <div className={`inline-flex p-3 rounded-md mb-4 ${colorMap[option.color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {t(option.labelKey)}
              </h3>
              <p className="text-xs text-muted">{t(option.descKey)}</p>
            </button>
          )
        })}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted" />
            <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('stock.recentActivity')}
            </h3>
            <span className="text-xs text-muted ml-2">
              {t('stock.lastMovements')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm appearance-none cursor-pointer"
                style={{ background: 'var(--bg-modal)' }}
              >
                <option value="all">{t('stock.allTypes')}</option>
                <option value="Delivery">{t('stock.delivery')}</option>
                <option value="Production">{t('stock.production')}</option>
                <option value="Sale">{t('stock.sale')}</option>
                <option value="Waste">{t('stock.waste')}</option>
                <option value="Return">{t('stock.return')}</option>
                <option value="Adjustment">{t('stock.adjust')}</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('stock.searchPlaceholder')}
                className="pl-10 pr-4 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm w-72"
              />
            </div>
          </div>
        </div>

        {(() => {
          const filteredMovements = recentMovements?.filter(m => {
            const matchesSearch =
              m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.reference.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesType = typeFilter === 'all' || m.type === typeFilter
            return matchesSearch && matchesType
          }) ?? []

          if (!recentMovements || recentMovements.length === 0) {
            return <p className="text-center text-muted py-8">{t('stock.noMovements')}</p>
          }

          if (filteredMovements.length === 0) {
            return <p className="text-center text-muted py-8">{t('stock.noMatch')}</p>
          }

          return (
            <table className="w-full">
              <thead>
                <tr className="border-b border-current/10">
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('common.time')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.product')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('common.type')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.quantity')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3 pl-4">{t('common.reference')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map(m => {
                  const typeColors: Record<string, string> = {
                    Delivery:     'bg-success-soft text-success',
                    Production:   'bg-info-soft text-info',
                    Sale:         'bg-current/5 text-muted',
                    Waste:        'bg-warning-soft text-warning',
                    Return:       'bg-current/5 text-muted',
                    Adjustment:   'bg-info-soft text-info',
                    InitialStock: 'bg-current/5 text-muted',
                  }
                  const typeColor = typeColors[m.type] ?? 'bg-current/5 text-muted'

                  return (
                    <tr key={m.id} className="border-b border-current/5 hover:bg-current/[0.02]">
                      <td className="py-3 text-sm text-muted whitespace-nowrap">
                        {new Date(m.recordedAt).toLocaleString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 font-medium">{m.productName}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${typeColor}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-medium ${m.quantity > 0 ? 'text-success' : 'text-warning'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="py-3 pl-4 text-sm text-muted">{m.reference}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setAdjustingMovement(m)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs text-muted hover:text-current border border-current/20 hover:border-[var(--color-gold)] rounded transition-all"
                        >
                          <Wrench className="w-3 h-3" />
                          {t('stock.adjust')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        })()}
      </div>

      {selectedType && (
        <MovementModal
          type={selectedType}
          products={products ?? []}
          isLoading={mutation.isPending}
          onSubmit={(payload) => mutation.mutate({ type: selectedType, payload })}
          onClose={() => setSelectedType(null)}
        />
      )}

      {adjustingMovement && (
        <AdjustmentModal
          originalMovement={adjustingMovement}
          isLoading={mutation.isPending}
          onSubmit={(payload) => mutation.mutate({ type: 'adjustment', payload })}
          onClose={() => setAdjustingMovement(null)}
        />
      )}
    </div>
  )
}

// ----- New movement modal -----
function MovementModal({ type, products, isLoading, onSubmit, onClose }: {
  type: MovementType
  products: any[]
  isLoading: boolean
  onSubmit: (payload: RecordMovementRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      productId,
      quantity: parseInt(quantity),
      reference,
      notes: notes || undefined,
    })
  }

  const title = `${t('stock.record')} ${t(`stock.${type}`)}`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="p-8 max-w-lg w-full rounded-xl border border-current/10 shadow-2xl"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {title}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {t('stock.title')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('dashboard.product')}</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            >
              <option value="">{t('stock.selectProduct')}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({t('stock.stockLabel')}: {p.currentStock})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.quantity')}</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.reference')}</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('stock.recording') : t('stock.record')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----- Adjustment modal -----
function AdjustmentModal({ originalMovement, isLoading, onSubmit, onClose }: {
  originalMovement: StockMovement
  isLoading: boolean
  onSubmit: (payload: RecordMovementRequest) => void
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      productId: originalMovement.productId,
      quantity: parseInt(adjustmentQuantity),
      reference: `Adjustment for ${originalMovement.type} (${originalMovement.reference})`,
      notes: notes || `Correcting ${originalMovement.type} dated ${new Date(originalMovement.recordedAt).toLocaleString(locale)}`,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="p-8 max-w-lg w-full rounded-xl border border-current/10 shadow-2xl"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('stock.makeAdjustment')}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {t('stock.adjustmentSubtitle')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="card p-4 mb-6 bg-current/[0.02]">
          <p className="text-xs uppercase tracking-wider text-muted mb-2">{t('stock.originalMovement')}</p>
          <p className="font-medium">{originalMovement.productName}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-muted">{t('common.type')}: <span className="text-current">{originalMovement.type}</span></span>
            <span className="text-muted">{t('common.quantity')}: <span className={originalMovement.quantity > 0 ? 'text-success' : 'text-warning'}>{originalMovement.quantity > 0 ? `+${originalMovement.quantity}` : originalMovement.quantity}</span></span>
          </div>
          <p className="text-xs text-muted mt-2">{originalMovement.reference}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('stock.adjustmentQuantity')}</label>
            <input
              type="number"
              value={adjustmentQuantity}
              onChange={(e) => setAdjustmentQuantity(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              placeholder="e.g. +27 / -10"
            />
            <p className="text-xs text-muted mt-2">💡 {t('stock.adjustmentTip')}</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('stock.reasonForAdjustment')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('stock.recording') : t('stock.recordAdjustment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
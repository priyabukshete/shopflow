import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus, Search, X, Check, XCircle, Eye, Clock, Filter, ShoppingBag, AlertCircle, Truck, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { orderApi } from '../api/orderApi'
import { inventoryApi } from '../api/inventoryApi'
import type { Order, PlaceOrderRequest, PlaceOrderItem } from '../types/order'

export function OrdersPage() {
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [showPlaceOrder, setShowPlaceOrder] = useState(false)
  const queryClient = useQueryClient()

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getAll(),
  })

  const placeOrderMutation = useMutation({
    mutationFn: orderApi.place,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowPlaceOrder(false)
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => orderApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => orderApi.cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setCancellingOrder(null)
    },
  })

  // Filter
  const filteredOrders = orders?.filter(o => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(term) ||
      (o.customerName?.toLowerCase().includes(term) ?? false)
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesType = typeFilter === 'all' || o.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  }) ?? []

  // Stats
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders?.filter(o => o.createdAt.startsWith(today)) ?? []
  const stats = {
    total: orders?.length ?? 0,
    pending: orders?.filter(o => o.status === 'Pending').length ?? 0,
    confirmedToday: todayOrders.filter(o => o.status === 'Confirmed').length,
    todayRevenue: todayOrders
      .filter(o => o.status === 'Confirmed' || o.status === 'Completed')
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('orders.title')}
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted">
            {t('orders.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowPlaceOrder(true)}
          className="px-4 py-2 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('orders.newOrder')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label={t('orders.totalOrders')} value={stats.total} color="navy" />
        <StatCard icon={Clock} label={t('orders.pending')} value={stats.pending} color="terra" highlight={stats.pending > 0} />
        <StatCard icon={Check} label={t('orders.confirmed')} value={stats.confirmedToday} color="sage" suffix={t('common.today')} />
        <StatCard icon={ShoppingBag} label={t('orders.todayRevenue')} value={stats.todayRevenue} color="gold" isCurrency />
      </div>

      {/* Orders table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('orders.title')}
          </h3>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm appearance-none cursor-pointer"
                style={{ background: 'var(--bg-modal)' }}
              >
                <option value="all">{t('orders.allStatuses')}</option>
                <option value="Pending">{t('orders.pending')}</option>
                <option value="Confirmed">{t('orders.confirmed')}</option>
                <option value="Cancelled">{t('orders.cancelled')}</option>
                <option value="Completed">{t('orders.completed')}</option>
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm cursor-pointer"
              style={{ background: 'var(--bg-modal)' }}
            >
              <option value="all">{t('orders.allTypes')}</option>
              <option value="WalkIn">{t('orders.walkIn')}</option>
              <option value="Pickup">{t('orders.pickup')}</option>
              <option value="Delivery">{t('orders.delivery')}</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('orders.searchOrders')}
                className="pl-10 pr-4 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm w-72"
              />
            </div>
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <p className="text-center text-muted py-12">{t('orders.noOrders')}</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-center text-muted py-12">{t('orders.noOrdersMatch')}</p>
        ) : (
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-3 [mask-image:linear-gradient(to_right,black_calc(100%-30px),transparent)] sm:[mask-image:none]">
            <table className="w-full min-w-[700px]">
              <thead className="sticky top-0 bg-[var(--color-cream)] dark:bg-[var(--color-ink)] z-10">
                <tr className="border-b border-current/10">
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('orders.orderNumber')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('orders.customer')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('orders.orderType')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('orders.itemCount')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('orders.total')}</th>
                  <th className="text-center text-xs uppercase tracking-wider text-muted py-3">{t('orders.status')}</th>
                  <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('orders.createdAt')}</th>
                  <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(o => {
                  const statusColors: Record<string, string> = {
                    Pending: 'bg-warning-soft text-warning',
                    Confirmed: 'bg-success-soft text-success',
                    Cancelled: 'bg-current/5 text-muted',
                    Completed: 'bg-info-soft text-info',
                  }
                  const statusColor = statusColors[o.status] ?? 'bg-current/5 text-muted'

                  const typeIcon = {
                    WalkIn: Wallet,
                    Pickup: ShoppingBag,
                    Delivery: Truck,
                  }[o.type]
                  const TypeIcon = typeIcon

                  return (
                    <tr key={o.id} className="border-b border-current/5 hover:bg-current/[0.02]">
                      <td className="py-4 font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                        {o.orderNumber}
                      </td>
                      <td className="py-4 text-sm">
                        {o.customerName ?? <span className="text-muted">—</span>}
                        {o.customerPhone && (
                          <p className="text-xs text-muted mt-1">{o.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-muted">
                          <TypeIcon className="w-3 h-3" />
                          {t(`orders.${o.type === 'WalkIn' ? 'walkIn' : o.type.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm">{o.items.length}</td>
                      <td className="py-4 text-right font-medium">CHF {o.totalAmount.toFixed(2)}</td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${statusColor}`}>
                          {t(`orders.${o.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-muted whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleString(locale, {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => setViewingOrder(o)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-current border border-current/20 hover:border-[var(--color-gold)] rounded transition-all"
                            title={t('orders.viewDetails')}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          {o.status === 'Pending' && (
                            <button
                              onClick={() => confirmMutation.mutate(o.id)}
                              disabled={confirmMutation.isPending}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-success border border-current/20 hover:border-[var(--color-sage)] rounded transition-all"
                              title={t('orders.confirm')}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          {(o.status === 'Pending' || o.status === 'Confirmed') && (
                            <button
                              onClick={() => setCancellingOrder(o)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-warning border border-current/20 hover:border-[var(--color-terra)] rounded transition-all"
                              title={t('orders.cancel')}
                            >
                              <XCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {viewingOrder && (
        <OrderDetailsModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}

      {cancellingOrder && (
        <CancelOrderModal
          order={cancellingOrder}
          isLoading={cancelMutation.isPending}
          onSubmit={(reason) => cancelMutation.mutate({ id: cancellingOrder.id, reason })}
          onClose={() => setCancellingOrder(null)}
        />
      )}

      {showPlaceOrder && (
        <PlaceOrderModal
          isLoading={placeOrderMutation.isPending}
          onSubmit={(data) => placeOrderMutation.mutate(data)}
          onClose={() => setShowPlaceOrder(false)}
        />
      )}
    </div>
  )
}

// ---- Stat Card ----
function StatCard({ icon: Icon, label, value, color, highlight, suffix, isCurrency }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  color: 'gold' | 'sage' | 'terra' | 'navy'
  highlight?: boolean
  suffix?: string
  isCurrency?: boolean
}) {
  const colorMap = {
    gold: 'text-info bg-info-soft',
    sage: 'text-success bg-success-soft',
    terra: 'text-warning bg-warning-soft',
    navy: 'text-muted bg-current/5',
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <div className={`p-2 rounded-md ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
        {isCurrency ? `CHF ${value.toFixed(2)}` : value}
      </p>
      {suffix && <p className="text-xs text-muted mt-1">{suffix}</p>}
      {highlight && value > 0 && <p className="text-xs mt-2 text-warning">⚠ Needs attention</p>}
    </div>
  )
}

// ---- Order Details Modal ----
function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="p-8 max-w-2xl w-full rounded-xl border border-current/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {order.orderNumber}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {t('orders.orderDetails')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <InfoField label={t('orders.status')} value={order.status} />
          <InfoField label={t('orders.orderType')} value={order.type} />
          <InfoField label={t('orders.customer')} value={order.customerName ?? '—'} />
          <InfoField label={t('orders.customerPhone')} value={order.customerPhone ?? '—'} />
          <InfoField
            label={t('orders.createdAt')}
            value={new Date(order.createdAt).toLocaleString(locale)}
          />
          <InfoField label={t('orders.createdBy')} value={order.createdBy} />
          {order.confirmedAt && (
            <InfoField
              label={t('orders.confirmedAt')}
              value={new Date(order.confirmedAt).toLocaleString(locale)}
            />
          )}
          {order.cancelledAt && (
            <InfoField
              label={t('orders.cancelledAt')}
              value={new Date(order.cancelledAt).toLocaleString(locale)}
            />
          )}
        </div>

        {order.cancellationReason && (
          <div className="card p-4 mb-6 bg-warning-soft border border-current/10">
            <p className="text-xs uppercase tracking-wider text-warning mb-1">
              {t('orders.cancellationReason')}
            </p>
            <p className="text-sm">{order.cancellationReason}</p>
          </div>
        )}

        {/* Items */}
        <h4 className="text-sm uppercase tracking-wider text-muted mb-3">
          {t('orders.itemDetails')}
        </h4>
        <div className="overflow-x-auto mb-6">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-current/10">
                <th className="text-left text-xs uppercase tracking-wider text-muted py-2">{t('dashboard.product')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-2">{t('common.quantity')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-2">{t('orders.unitPrice')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-2">{t('orders.lineTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <tr key={item.id} className="border-b border-current/5">
                  <td className="py-2 font-medium">{item.productName}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">CHF {item.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-medium">CHF {item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right text-sm uppercase tracking-wider">
                  {t('orders.total')}
                </td>
                <td className="py-3 text-right text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                  CHF {order.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest"
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted mb-1">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

// ---- Cancel Order Modal ----
function CancelOrderModal({ order, isLoading, onSubmit, onClose }: {
  order: Order
  isLoading: boolean
  onSubmit: (reason: string) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(reason)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="p-8 max-w-md w-full rounded-xl border border-current/10 shadow-2xl"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('orders.cancelOrder')}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {order.orderNumber}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="card p-4 mb-6 bg-warning-soft border border-current/10">
          <p className="text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('orders.cancellationConfirm')}</span>
          </p>
          <p className="text-xs text-muted mt-2">💡 {t('orders.cancellationNote')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">
              {t('orders.cancellationReason')}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              autoFocus
              rows={3}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
              placeholder={t('orders.cancellationReasonPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-terra)] bg-[var(--color-terra)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('orders.cancelling') : t('orders.cancelOrder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---- Place Order Modal ----
function PlaceOrderModal({ isLoading, onSubmit, onClose }: {
  isLoading: boolean
  onSubmit: (data: PlaceOrderRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [orderType, setOrderType] = useState<'WalkIn' | 'Pickup' | 'Delivery'>('WalkIn')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [items, setItems] = useState<PlaceOrderItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryApi.getProducts,
  })

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const addItem = () => {
    if (!selectedProductId) return
    const product = products?.find(p => p.id === selectedProductId)
    if (!product) return

    const qty = parseInt(quantity)
    if (qty <= 0 || qty > product.currentStock) {
      alert(`Stock: ${product.currentStock}`)
      return
    }

    const existing = items.find(i => i.productId === product.id)
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + qty } : i))
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.price,
      }])
    }
    setSelectedProductId('')
    setQuantity('1')
  }

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId))
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) {
      alert(t('orders.noProductsInOrder'))
      return
    }
    onSubmit({
      orderType,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      items,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="p-8 max-w-2xl w-full rounded-xl border border-current/10 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('orders.newOrder')}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">
              {t('orders.placeOrder')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Order type */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">
              {t('orders.selectCustomerType')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['WalkIn', 'Pickup', 'Delivery'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOrderType(type)}
                  className={`p-3 rounded-md text-sm transition-all border ${orderType === type
                    ? 'bg-[var(--color-gold)] text-white border-[var(--color-gold)]'
                    : 'border-current/20 hover:border-current/40'
                    }`}
                >
                  <p className="font-medium">{t(`orders.${type === 'WalkIn' ? 'walkIn' : type.toLowerCase()}`)}</p>
                  <p className="text-xs mt-1 opacity-80">
                    {t(`orders.${type === 'WalkIn' ? 'walkIn' : type.toLowerCase()}Desc`)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">
                {t('orders.customerNameOptional')}
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="Maria Müller"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">
                {t('orders.customerPhoneRequired')}
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required={orderType === 'Delivery'}
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="+41 79 123 45 67"
              />
            </div>
          </div>

          {/* Add product */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">
              {t('orders.selectProducts')}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-1 bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              >
                <option value="">{t('stock.selectProduct')}</option>
                {products?.filter(p => p.isActive && p.currentStock > 0).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (CHF {p.price.toFixed(2)} | stock: {p.currentStock})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-20 bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none text-center"
              />

              <button
                type="button"
                onClick={addItem}
                disabled={!selectedProductId}
                className="px-4 py-2 border border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white transition-all uppercase text-xs tracking-widest disabled:opacity-50"
              >
                {t('orders.addProduct')}
              </button>
            </div>
          </div>

          {/* Items list */}
          {items.length > 0 && (
            <div className="card p-4 bg-current/[0.02]">
              <h4 className="text-xs uppercase tracking-wider text-muted mb-3">
                {t('orders.itemDetails')}
              </h4>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center justify-between py-2 border-b border-current/5">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted">
                        CHF {item.unitPrice.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium mr-3">
                      CHF {(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-muted hover:text-warning"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-current/10">
                  <span className="text-sm uppercase tracking-wider">{t('orders.total')}</span>
                  <span className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    CHF {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading || items.length === 0} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('orders.placing') : t('orders.placeOrder')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
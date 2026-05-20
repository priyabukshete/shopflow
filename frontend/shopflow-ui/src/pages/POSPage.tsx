import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, X, Plus, Minus, CreditCard, Smartphone, Wallet, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '../api/inventoryApi'
import { useAuth } from '../contexts/AuthContext'
import type { Product } from '../types/inventory'

interface CartItem {
  product: Product
  quantity: number
}

type PaymentMethod = 'TWINT' | 'Cash' | 'Card'

export function POSPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showSuccess, setShowSuccess] = useState<{ orderNumber: string; total: number; payment: PaymentMethod } | null>(null)
  const queryClient = useQueryClient()

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryApi.getProducts,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: inventoryApi.getCategories,
  })

  const checkoutMutation = useMutation({
    mutationFn: async ({ items, orderNumber }: { items: CartItem[]; orderNumber: string }) => {
      await Promise.all(
        items.map(item =>
          inventoryApi.recordSale({
            productId: item.product.id,
            quantity: item.quantity,
            reference: `Order #${orderNumber}`,
            notes: `${t('pos.cashier')}: ${user?.fullName ?? 'Unknown'}`,
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['daily-report'] })
      queryClient.invalidateQueries({ queryKey: ['recent-movements'] })
      setCart([])
    },
  })

  const filteredProducts = (products ?? []).filter(p => {
    if (selectedCategory === 'all') return p.isActive && p.currentStock > 0
    return p.categoryId === selectedCategory && p.isActive && p.currentStock > 0
  })

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          alert(`Only ${product.currentStock} ${product.name} in stock!`)
          return prev
        }
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.product.id !== productId) return i
          const newQty = i.quantity + delta
          if (newQty <= 0) return null
          if (newQty > i.product.currentStock) {
            alert(`Only ${i.product.currentStock} in stock!`)
            return i
          }
          return { ...i, quantity: newQty }
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId))
  }

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handlePayment = async (method: PaymentMethod) => {
    if (cart.length === 0) return
    const orderNumber = `${Date.now().toString().slice(-6)}`
    await checkoutMutation.mutateAsync({ items: cart, orderNumber })
    setShowSuccess({ orderNumber, total, payment: method })
  }

  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('pos.title')}
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted">
            {t('pos.cashier')}: {user?.fullName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-muted">{t('pos.currentTime')}</p>
          <p className="text-lg" style={{ fontFamily: 'var(--font-serif)' }}>
            {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--color-gold)] text-white'
                    : 'border border-current/20 hover:border-current/40'
                }`}
              >
                {t('pos.allProducts')}
              </button>
              {categories?.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-4 py-2 rounded-md text-sm transition-all ${
                    selectedCategory === c.id
                      ? 'bg-[var(--color-gold)] text-white'
                      : 'border border-current/20 hover:border-current/40'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            {filteredProducts.length === 0 ? (
              <p className="text-center text-muted py-12">
                {t('dashboard.noProducts')}
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    disabled={p.currentStock === 0}
                    className="border border-current/15 rounded-lg p-4 hover:border-[var(--color-gold)] hover:bg-current/[0.02] transition-all text-left disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🥖</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        p.isLowStock ? 'bg-warning-soft text-warning' : 'bg-current/5 text-muted'
                      }`}>
                        {p.currentStock} {t('pos.left')}
                      </span>
                    </div>
                    <p className="font-medium text-sm mb-1 group-hover:text-[var(--color-gold)] transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted mb-2">{p.categoryName}</p>
                    <p className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
                      CHF {p.price.toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div className="card p-6 h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="w-5 h-5" />
            <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
              {t('pos.currentOrder')}
            </h3>
            {itemCount > 0 && (
              <span className="ml-auto text-xs bg-current/10 px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? t('pos.item') : t('pos.items')}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="text-center text-muted py-12">
              {t('pos.noItems')}<br />{t('pos.tapToAdd')}
            </p>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 py-2 border-b border-current/5">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted">
                        CHF {item.product.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-7 h-7 rounded-md border border-current/20 hover:border-current/40 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-md border border-current/20 hover:border-current/40 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-muted hover:text-warning"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-current/10 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted">{t('pos.subtotal')}</span>
                  <span className="text-sm">CHF {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs uppercase tracking-wider text-muted">{t('pos.vat')} (2.6%)</span>
                  <span className="text-sm">CHF {(total * 0.026).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-current/10">
                  <span className="text-sm uppercase tracking-wider">{t('pos.total')}</span>
                  <span className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    CHF {(total * 1.026).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted text-center mb-2">
                  {t('pos.selectPayment')}
                </p>
                <button
                  onClick={() => handlePayment('TWINT')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-3 border border-current/20 hover:border-[var(--color-gold)] hover:bg-current/[0.02] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4" />
                  {t('pos.twint')}
                </button>
                <button
                  onClick={() => handlePayment('Card')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-3 border border-current/20 hover:border-[var(--color-gold)] hover:bg-current/[0.02] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('pos.card')}
                </button>
                <button
                  onClick={() => handlePayment('Cash')}
                  disabled={checkoutMutation.isPending}
                  className="w-full py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  {checkoutMutation.isPending ? t('pos.processing') : t('pos.cash')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          orderNumber={showSuccess.orderNumber}
          total={showSuccess.total * 1.026}
          payment={showSuccess.payment}
          onClose={() => setShowSuccess(null)}
        />
      )}
    </div>
  )
}

function SuccessModal({ orderNumber, total, payment, onClose }: {
  orderNumber: string
  total: number
  payment: PaymentMethod
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="p-8 max-w-md w-full rounded-xl border border-current/10 shadow-2xl text-center"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success-soft flex items-center justify-center">
          <Check className="w-8 h-8 text-success" />
        </div>

        <h3 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
          {t('pos.paymentReceived')}
        </h3>
        <p className="text-xs uppercase tracking-widest text-muted mb-6">
          {t('pos.receipt')} #{orderNumber}
        </p>

        <div className="card p-4 mb-6 bg-current/[0.02]">
          <p className="text-xs uppercase tracking-wider text-muted mb-1">{t('pos.totalPaid')}</p>
          <p className="text-4xl mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            CHF {total.toFixed(2)}
          </p>
          <p className="text-xs text-muted">
            {t('pos.method')}: <span className="text-current font-medium">{payment}</span>
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest"
        >
          {t('pos.newOrder')}
        </button>
      </div>
    </div>
  )
}
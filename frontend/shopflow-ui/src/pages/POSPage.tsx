import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, X, Plus, Minus, CreditCard, Smartphone, Wallet, Check, Printer, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '../api/inventoryApi'
import { useAuth } from '../contexts/AuthContext'
import type { Product } from '../types/inventory'

interface CartItem {
  product: Product
  quantity: number
}

type PaymentMethod = 'TWINT' | 'Cash' | 'Card'

interface CompletedOrder {
  orderNumber: string
  total: number
  payment: PaymentMethod
  items: CartItem[]
  timestamp: Date
}

export function POSPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showSuccess, setShowSuccess] = useState<CompletedOrder | null>(null)
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
    const snapshot = [...cart]
    const totalSnapshot = total
    await checkoutMutation.mutateAsync({ items: snapshot, orderNumber })
    setShowSuccess({
      orderNumber,
      total: totalSnapshot,
      payment: method,
      items: snapshot,
      timestamp: new Date(),
    })
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
        <ReceiptModal
          order={showSuccess}
          cashierName={user?.fullName ?? 'Cashier'}
          onClose={() => setShowSuccess(null)}
        />
      )}
    </div>
  )
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────

function ReceiptModal({
  order,
  cashierName,
  onClose,
}: {
  order: CompletedOrder
  cashierName: string
  onClose: () => void
}) {
  const { t, i18n } = useTranslation()
  const receiptRef = useRef<HTMLDivElement>(null)
  const locale = i18n.language === 'de' ? 'de-CH' : 'en-CH'

  const subtotal = order.total
  const vat = subtotal * 0.026
  const grandTotal = subtotal * 1.026

  const formattedDate = order.timestamp.toLocaleDateString(locale, {
    day: '2-digit', month: 'long', year: 'numeric'
  })
  const formattedTime = order.timestamp.toLocaleTimeString(locale, {
    hour: '2-digit', minute: '2-digit'
  })

  const handlePrint = () => {
    const receiptContent = receiptRef.current
    if (!receiptContent) return

    const printWindow = window.open('', '_blank', 'width=400,height=700')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>ShopFlow Receipt #${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #1a1a1a;
              background: white;
              padding: 24px;
              max-width: 320px;
              margin: 0 auto;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 18px; }
            .small { font-size: 10px; color: #666; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 16px; font-weight: bold; }
            .logo { font-size: 22px; font-weight: bold; margin-bottom: 2px; }
            .check { font-size: 28px; margin: 12px 0; }
            @media print {
              body { padding: 8px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="logo">ShopFlow</div>
            <div class="small">Swiss Retail Management</div>
            <div class="small">Made in Bern 🇨🇭</div>
            <div class="divider"></div>
            <div class="check">✓</div>
            <div class="bold large">Payment Received</div>
            <div class="small" style="margin-top:4px">Receipt #${order.orderNumber}</div>
          </div>

          <div class="divider"></div>

          <div class="small" style="margin-bottom:8px">
            <div class="row"><span>Date</span><span>${formattedDate}</span></div>
            <div class="row"><span>Time</span><span>${formattedTime}</span></div>
            <div class="row"><span>Cashier</span><span>${cashierName}</span></div>
            <div class="row"><span>Payment</span><span>${order.payment}</span></div>
          </div>

          <div class="divider"></div>

          ${order.items.map(item => `
            <div class="row">
              <span style="flex:1;padding-right:8px">${item.product.name}</span>
              <span style="white-space:nowrap">${item.quantity} × CHF ${item.product.price.toFixed(2)}</span>
            </div>
            <div class="row small">
              <span></span>
              <span>CHF ${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}

          <div class="divider"></div>

          <div class="row small"><span>Subtotal</span><span>CHF ${subtotal.toFixed(2)}</span></div>
          <div class="row small"><span>VAT (2.6%)</span><span>CHF ${vat.toFixed(2)}</span></div>

          <div class="divider"></div>

          <div class="total-row"><span>TOTAL</span><span>CHF ${grandTotal.toFixed(2)}</span></div>

          <div class="divider"></div>

          <div class="center small" style="margin-top:12px">
            <div>Thank you for your purchase!</div>
            <div>Danke für Ihren Einkauf!</div>
            <div style="margin-top:8px">178-105-194-108.nip.io</div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 300)
  }

  const handleDownloadPDF = async () => {
    // Dynamically import html2canvas and jsPDF only when needed
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    const receiptEl = receiptRef.current
    if (!receiptEl) return

    const canvas = await html2canvas(receiptEl, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, canvas.height * 80 / canvas.width],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width)
    pdf.save(`ShopFlow-Receipt-${order.orderNumber}.pdf`)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        className="max-w-sm w-full rounded-xl border border-current/10 shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-modal)' }}
      >
        {/* Receipt content — this gets captured for PDF */}
        <div ref={receiptRef} style={{ background: '#ffffff', color: '#1a1a1a' }} className="p-6">

          {/* Header */}
          <div className="text-center mb-5">
            <p className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
              ShopFlow
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Swiss Retail Management · Made in Bern 🇨🇭</p>

            <div className="my-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#d4af37' }}>
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>

            <p className="font-semibold text-lg" style={{ color: '#1a1a1a' }}>Payment Received</p>
            <p className="text-xs text-gray-400 mt-1">Receipt #{order.orderNumber}</p>
          </div>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-gray-300 my-4" />

          {/* Order meta */}
          <div className="space-y-1.5 mb-4">
            {[
              { label: 'Date', value: formattedDate },
              { label: 'Time', value: formattedTime },
              { label: 'Cashier', value: cashierName },
              { label: 'Payment', value: order.payment },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium" style={{ color: '#1a1a1a' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-4" />

          {/* Items */}
          <div className="space-y-2 mb-4">
            {order.items.map(item => (
              <div key={item.product.id}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium flex-1 pr-2 truncate" style={{ color: '#1a1a1a' }}>
                    {item.product.name}
                  </span>
                  <span className="text-gray-500 text-xs whitespace-nowrap">
                    {item.quantity} × CHF {item.product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-end text-xs text-gray-400">
                  CHF {(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-4" />

          {/* Totals */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Subtotal</span>
              <span style={{ color: '#1a1a1a' }}>CHF {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">VAT (2.6%)</span>
              <span style={{ color: '#1a1a1a' }}>CHF {vat.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-300 my-3" />

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1a1a1a' }}>Total</span>
            <span className="text-2xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a' }}>
              CHF {grandTotal.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-dashed border-gray-300 my-4" />

          {/* Footer */}
          <div className="text-center space-y-0.5">
            <p className="text-xs text-gray-400">Thank you for your purchase!</p>
            <p className="text-xs text-gray-400">Danke für Ihren Einkauf!</p>
            <p className="text-xs text-gray-300 mt-2">178-105-194-108.nip.io</p>
          </div>
        </div>

        {/* Action buttons — outside receipt div so they don't appear in PDF */}
        <div className="p-4 space-y-2" style={{ background: 'var(--bg-modal)' }}>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 border border-current/20 hover:border-[var(--color-gold)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              {t('pos.print') ?? 'Print'}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="py-2.5 border border-current/20 hover:border-[var(--color-gold)] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest rounded-lg"
            >
              <Download className="w-3.5 h-3.5" />
              {t('pos.downloadPdf') ?? 'PDF'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest rounded-lg"
          >
            {t('pos.newOrder')}
          </button>
        </div>
      </div>
    </div>
  )
}

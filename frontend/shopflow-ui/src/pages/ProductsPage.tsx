import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Plus, Search, X, AlertTriangle, Tag, Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { inventoryApi } from '../api/inventoryApi'
import type { AddProductRequest, AddCategoryRequest, UpdateProductRequest } from '../api/inventoryApi'
import type { Product } from '../types/inventory'

export function ProductsPage() {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: inventoryApi.getProducts,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: inventoryApi.getCategories,
  })

  const addProductMutation = useMutation({
    mutationFn: inventoryApi.addProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setShowAddProduct(false)
    },
  })

  const addCategoryMutation = useMutation({
    mutationFn: inventoryApi.addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowAddCategory(false)
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) => 
      inventoryApi.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setEditingProduct(null)
    },
  })

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || p.categoryId === categoryFilter
    return matchesSearch && matchesCategory
  }) ?? []

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('products.title')}
          </h2>
          <p className="text-xs uppercase tracking-widest text-muted">
            {t('products.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-4 py-2 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest inline-flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            {t('products.newCategory')}
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-4 py-2 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('products.newProduct')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('dashboard.totalProducts')}</p>
            <Package className="w-4 h-4 text-muted" />
          </div>
          <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {products?.length ?? 0}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('products.categories')}</p>
            <Tag className="w-4 h-4 text-muted" />
          </div>
          <p className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {categories?.length ?? 0}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider text-muted">{t('dashboard.lowStock')}</p>
            <AlertTriangle className="w-4 h-4 text-warning" />
          </div>
          <p className="text-4xl text-warning" style={{ fontFamily: 'var(--font-serif)' }}>
            {products?.filter(p => p.isLowStock).length ?? 0}
          </p>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('products.productCatalog')}
          </h3>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-transparent border border-current/20 rounded-md focus:border-current/60 focus:outline-none text-sm cursor-pointer"
              style={{ background: 'var(--bg-modal)' }}
            >
              <option value="all">{t('products.allCategories')}</option>
              {categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

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
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted py-12">
            {products?.length === 0 ? t('dashboard.noProducts') : t('stock.noMatch')}
          </p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-current/10">
                <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('common.name')}</th>
                <th className="text-left text-xs uppercase tracking-wider text-muted py-3">{t('common.category')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.price')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('dashboard.inStock')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('products.threshold')}</th>
                <th className="text-center text-xs uppercase tracking-wider text-muted py-3">{t('common.status')}</th>
                <th className="text-right text-xs uppercase tracking-wider text-muted py-3">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id} className="border-b border-current/5 hover:bg-current/[0.02]">
                  <td className="py-4">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted mt-1">{p.description}</p>
                  </td>
                  <td className="py-4 text-sm text-muted">{p.categoryName}</td>
                  <td className="py-4 text-right font-medium">CHF {p.price.toFixed(2)}</td>
                  <td className={`py-4 text-right font-medium ${p.isLowStock ? 'text-warning' : ''}`}>
                    {p.currentStock}
                  </td>
                  <td className="py-4 text-right text-sm text-muted">{p.lowStockThreshold}</td>
                  <td className="py-4 text-center">
                    {p.isLowStock ? (
                      <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-warning-soft text-warning">
                        {t('products.lowStockLabel')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-success-soft text-success">
                        {t('common.active')}
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs text-muted hover:text-current border border-current/20 hover:border-[var(--color-gold)] rounded transition-all"
                    >
                      <Pencil className="w-3 h-3" />
                      {t('common.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddProduct && (
        <AddProductModal
          categories={categories ?? []}
          isLoading={addProductMutation.isPending}
          onSubmit={(data) => addProductMutation.mutate(data)}
          onClose={() => setShowAddProduct(false)}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          isLoading={addCategoryMutation.isPending}
          onSubmit={(data) => addCategoryMutation.mutate(data)}
          onClose={() => setShowAddCategory(false)}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isLoading={updateProductMutation.isPending}
          onSubmit={(data) => updateProductMutation.mutate({ id: editingProduct.id, data })}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}

// ----- Add Product Modal -----
function AddProductModal({ categories, isLoading, onSubmit, onClose }: {
  categories: any[]
  isLoading: boolean
  onSubmit: (data: AddProductRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [initialStock, setInitialStock] = useState('')
  const [lowStockThreshold, setLowStockThreshold] = useState('5')
  const [categoryId, setCategoryId] = useState('')

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
      name,
      description,
      price: parseFloat(price),
      initialStock: parseInt(initialStock),
      lowStockThreshold: parseInt(lowStockThreshold),
      categoryId,
    })
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
              {t('products.newProduct')}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.productName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              placeholder="Vollkornbrot"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.category')}</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            >
              <option value="">— {t('common.category')} —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.price')} (CHF)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="4.95"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.initialStock')}</label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.lowStockAlert')}</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
                placeholder="5"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('products.adding') : t('products.addProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----- Add Category Modal -----
function AddCategoryModal({ isLoading, onSubmit, onClose }: {
  isLoading: boolean
  onSubmit: (data: AddCategoryRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, description })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="p-8 max-w-md w-full rounded-xl border border-current/10 shadow-2xl"
        style={{ background: 'var(--bg-modal)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>
            {t('products.newCategory')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.categoryName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('products.adding') : t('products.addCategory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ----- Edit Product Modal -----
function EditProductModal({ product, isLoading, onSubmit, onClose }: {
  product: Product
  isLoading: boolean
  onSubmit: (data: UpdateProductRequest) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(product.price.toString())
  const [lowStockThreshold, setLowStockThreshold] = useState(product.lowStockThreshold.toString())

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
      name,
      description,
      price: parseFloat(price),
      lowStockThreshold: parseInt(lowStockThreshold),
    })
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
              {t('products.editProduct')}
            </h3>
            <p className="text-xs uppercase tracking-widest text-muted">{product.categoryName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-current/5 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="card p-4 mb-6 bg-current/[0.02]">
          <p className="text-xs uppercase tracking-wider text-muted mb-2">{t('products.currentStock')}</p>
          <p className="text-2xl font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
            {product.currentStock} {t('products.units')}
          </p>
          <p className="text-xs text-muted mt-1">💡 {t('products.stockTip')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.productName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={2}
              className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('common.price')} (CHF)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-muted mb-2">{t('products.lowStockAlert')}</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                required
                className="w-full bg-transparent border-b border-current/20 py-2 px-1 focus:border-current/60 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-current/30 hover:border-current transition-all uppercase text-xs tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={isLoading} className="flex-1 py-3 border border-[var(--color-gold)] bg-[var(--color-gold)] text-white hover:opacity-90 transition-all uppercase text-xs tracking-widest disabled:opacity-50">
              {isLoading ? t('products.saving') : t('products.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
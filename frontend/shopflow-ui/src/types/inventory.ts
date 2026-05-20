export interface Product {
  id: string
  name: string
  description: string
  price: number
  currentStock: number
  lowStockThreshold: number
  isLowStock: boolean
  categoryId: string
  categoryName: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

export interface DailyReport {
  date: string
  products: ProductDailyMovement[]
}

export interface ProductDailyMovement {
  productId: string
  productName: string
  delivered: number
  produced: number
  sold: number
  wasted: number
  returned: number
  currentStock: number
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  type: string
  quantity: number
  reference: string
  notes: string | null
  recordedAt: string
  recordedBy: string
}
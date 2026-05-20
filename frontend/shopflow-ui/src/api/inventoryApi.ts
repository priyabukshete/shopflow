import { apiClient } from './client'
import type { Product, DailyReport, StockMovement } from '../types/inventory'

export interface UpdateProductRequest {
  name: string
  description: string
  price: number
  lowStockThreshold: number
}

export interface Category {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
}

export interface AddCategoryRequest {
  name: string
  description: string
}

export interface AddProductRequest {
  name: string
  description: string
  price: number
  initialStock: number
  lowStockThreshold: number
  categoryId: string
}

export interface RecordMovementRequest {
  productId: string
  quantity: number
  reference: string
  notes?: string
}

export const inventoryApi = {

  getReportRange: async (from: string, to: string): Promise<DailyReport[]> => {
    const response = await apiClient.get<DailyReport[]>(
      `/inventory/api/reports/range?from=${from}&to=${to}`
    )
    return response.data
  },

  updateProduct: async (id: string, data: UpdateProductRequest): Promise<Product> => {
    const response = await apiClient.put<Product>(`/inventory/api/products/${id}`, data)
    return response.data
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/inventory/api/categories')
    return response.data
  },

  addCategory: async (data: AddCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/inventory/api/categories', data)
    return response.data
  },

  // Products  
  addProduct: async (data: AddProductRequest): Promise<Product> => {
    const response = await apiClient.post<Product>('/inventory/api/products', data)
    return response.data
  },

  // Existing
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get<Product[]>('/inventory/api/products')
    return response.data
  },

  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const url = date
      ? `/inventory/api/reports/daily?date=${date}`
      : '/inventory/api/reports/daily'
    const response = await apiClient.get<DailyReport>(url)
    return response.data
  },

  getProductMovements: async (productId: string): Promise<StockMovement[]> => {
    const response = await apiClient.get<StockMovement[]>(
      `/inventory/api/stockmovements/product/${productId}`
    )
    return response.data
  },

  getRecentMovements: async (limit: number = 50): Promise<StockMovement[]> => {
    const response = await apiClient.get<StockMovement[]>(
      `/inventory/api/stockmovements/recent?limit=${limit}`
    )
    return response.data
  },

  recordAdjustment: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/adjustment', data)
    return response.data
  },

  // NEW — Stock movement actions
  recordDelivery: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/delivery', data)
    return response.data
  },

  recordProduction: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/production', data)
    return response.data
  },

  recordSale: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/sale', data)
    return response.data
  },

  recordWaste: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/waste', data)
    return response.data
  },

  recordReturn: async (data: RecordMovementRequest): Promise<StockMovement> => {
    const response = await apiClient.post<StockMovement>('/inventory/api/stockmovements/return', data)
    return response.data
  },
}
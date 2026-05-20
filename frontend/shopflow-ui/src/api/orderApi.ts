import { apiClient } from './client'
import type { Order, PlaceOrderRequest } from '../types/order'

export const orderApi = {
  getAll: async (status?: string): Promise<Order[]> => {
    const url = status ? `/orders/api/orders?status=${status}` : '/orders/api/orders'
    const response = await apiClient.get<Order[]>(url)
    return response.data
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/api/orders/${id}`)
    return response.data
  },

  place: async (data: PlaceOrderRequest): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders/api/orders', data)
    return response.data
  },

  confirm: async (id: string): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/api/orders/${id}/confirm`)
    return response.data
  },

  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await apiClient.post<Order>(`/orders/api/orders/${id}/cancel`, { reason })
    return response.data
  },
}
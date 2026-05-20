export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  customerPhone: string | null
  totalAmount: number
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'
  type: 'WalkIn' | 'Pickup' | 'Delivery'
  createdAt: string
  confirmedAt: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdBy: string
  items: OrderItem[]
}

export interface PlaceOrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface PlaceOrderRequest {
  orderType: 'WalkIn' | 'Pickup' | 'Delivery'
  customerName?: string | null
  customerPhone?: string | null
  items: PlaceOrderItem[]
}
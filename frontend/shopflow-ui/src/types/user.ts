export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

export interface RegisterUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}
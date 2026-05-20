export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  email: string
  fullName: string
  role: string
  expiresAt: string
}

export interface User {
  id: string
  email: string
  fullName: string
  role: string
}
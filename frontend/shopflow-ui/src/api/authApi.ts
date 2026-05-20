import { apiClient } from './client'
import type { LoginRequest, AuthResponse } from '../types/auth'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/identity/api/auth/login', data)
    return response.data
  },
}
import { apiClient } from './client'
import type { User, RegisterUserRequest } from '../types/user'

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/identity/api/users')
    return response.data
  },

  register: async (data: RegisterUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/identity/api/auth/register', data)
    return response.data
  },

  setStatus: async (userId: string, isActive: boolean): Promise<User> => {
    const response = await apiClient.patch<User>(
      `/identity/api/users/${userId}/status`,
      { isActive }
    )
    return response.data
  },
}
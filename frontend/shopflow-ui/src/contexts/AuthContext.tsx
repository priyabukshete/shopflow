import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types/auth'
import { jwtDecode } from 'jwt-decode'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (token: string, email: string, fullName: string, role: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface JwtPayload {
  exp: number
  email: string
  given_name: string
  family_name: string
  role: string
  nameid: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('shopflow-token')
    const userData = localStorage.getItem('shopflow-user')
    
    if (token && userData) {
      try {
        const decoded = jwtDecode<JwtPayload>(token)
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(userData))
        } else {
          localStorage.clear()
        }
      } catch {
        localStorage.clear()
      }
    }
  }, [])

  const login = (token: string, email: string, fullName: string, role: string) => {
    localStorage.setItem('shopflow-token', token)
    const decoded = jwtDecode<JwtPayload>(token)
    const userData: User = {
      id: decoded.nameid,
      email,
      fullName,
      role,
    }
    localStorage.setItem('shopflow-user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('shopflow-token')
    localStorage.removeItem('shopflow-user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
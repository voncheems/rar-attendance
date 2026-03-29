import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('rar_token')
    const saved  = localStorage.getItem('rar_user')
    if (token && saved) {
      try {
        setUser(JSON.parse(saved))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password })
    const { token, user } = data
    localStorage.setItem('rar_token', token)
    localStorage.setItem('rar_user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('rar_token')
    localStorage.removeItem('rar_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
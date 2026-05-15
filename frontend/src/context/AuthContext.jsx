import { createContext, useContext, useState, useEffect } from 'react'
import api, { USE_MOCK } from '../services/api'
import { mockTokens } from '@data/auth'
import { getStoredUser, setStoredUser, clearStoredUser, resolveUserFromLogin } from '../services/mockStore'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (USE_MOCK) {
        const token = localStorage.getItem('access_token')
        const stored = getStoredUser()
        if (token && stored) {
          setUser(stored)
        }
        setLoading(false)
        return
      }

      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const response = await api.get('/users/me/')
          setUser(response.data)
        } catch (error) {
          console.error('Failed to fetch user profile', error)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (identifier) => {
    if (USE_MOCK) {
      const userData = resolveUserFromLogin(identifier)
      localStorage.setItem('access_token', mockTokens.access)
      localStorage.setItem('refresh_token', mockTokens.refresh)
      setUser(userData)
      return userData
    }

    const response = await api.post('/auth/login/', { username: identifier, password: identifier })
    const { access, refresh, user: userData } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    if (USE_MOCK) clearStoredUser()
    setUser(null)
  }

  const value = { user, loading, login, logout, setUser }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

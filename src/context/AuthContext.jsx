import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import apiClient from '../api/client.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on app load
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const userData = JSON.parse(localStorage.getItem('userData'))
          if (userData && userData.id) {
            // Fetch fresh user data from API
            const freshUserData = await apiClient.getUser(userData.id)
            setUser(freshUserData)
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = useCallback(async (userData, token) => {
    try {
      // Use API client for login
      const response = await apiClient.login(userData.email, 'password')

      // Store token and user data in localStorage for persistence
      localStorage.setItem('token', token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      setUser(response.user)
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setUser(null)
  }, [])

  const updateUserCoins = useCallback(async (newCoins) => {
    if (user) {
      try {
        const updatedUser = await apiClient.updateUserCoins(user.id, newCoins)
        setUser(updatedUser)
        localStorage.setItem('userData', JSON.stringify(updatedUser))
      } catch (error) {
        console.error('Error updating user coins:', error)
      }
    }
  }, [user])

  const value = useMemo(() => ({
    user,
    login,
    logout,
    loading,
    updateUserCoins
  }), [user, login, logout, loading, updateUserCoins])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

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
  // No code needed here for the "fix" instruction, as the AuthContext is already set up correctly.

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // In a real app, you'd verify the token with your backend
        const userData = JSON.parse(localStorage.getItem('userData'))
        // Initialize coins for students if not present
        if (userData.userType === 'student' && userData.coins === undefined) {
          userData.coins = 100 // Starting coins for new students
          localStorage.setItem('userData', JSON.stringify(userData))
        }
        setUser(userData)
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    // Initialize coins for students
    if (userData.userType === 'student' && userData.coins === undefined) {
      userData.coins = 100
    }
    localStorage.setItem('token', token)
    localStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setUser(null)
  }

  const updateUserCoins = (coinsToAdd) => {
    if (user && user.userType === 'student') {
      const updatedUser = {
        ...user,
        coins: (user.coins || 0) + coinsToAdd
      }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return updatedUser.coins
    }
    return 0
  }

  const value = {
    user,
    login,
    logout,
    loading,
    updateUserCoins
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
}

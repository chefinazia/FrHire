import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Logout = () => {
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = () => {
    // Simulate logout process
    setIsLoggedOut(true)
    logout()
    // Reset the logged out state after showing success message
    setTimeout(() => {
      setIsLoggedOut(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isLoggedOut ? 'Logged Out Successfully' : 'Logout'}
          </h2>
          
          {!isLoggedOut && user && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Logged in as:</strong> {user.name}
              </p>
              <p className="text-sm text-blue-600">
                {user.email} • {user.userType}
              </p>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            {isLoggedOut 
              ? 'You have been successfully logged out of your account.' 
              : 'Are you sure you want to logout? This action cannot be undone.'
            }
          </p>

          {!isLoggedOut && (
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Confirm Logout
              </button>

              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          )}

          {isLoggedOut && (
            <div className="space-y-3">
              <div className="text-green-600 text-sm font-medium">
                ✓ Logout completed successfully
              </div>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Return to Home
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Logout

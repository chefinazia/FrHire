import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Predefined user accounts
      const users = [
        // Student accounts
        {
          email: 'john@student.com',
          password: 'password',
          userData: {
            id: 1,
            email: 'john@student.com',
            name: 'John Smith',
            userType: 'student',
            coins: 100
          }
        },
        {
          email: 'jane@student.com',
          password: 'password',
          userData: {
            id: 2,
            email: 'jane@student.com',
            name: 'Jane Doe',
            userType: 'student',
            coins: 100
          }
        },
        {
          email: 'mike@student.com',
          password: 'password',
          userData: {
            id: 3,
            email: 'mike@student.com',
            name: 'Mike Johnson',
            userType: 'student',
            coins: 100
          }
        },
        // Recruiter account
        {
          email: 'recruiter@example.com',
          password: 'password',
          userData: {
            id: 4,
            email: 'recruiter@example.com',
            name: 'Sarah Wilson',
            userType: 'recruiter'
          }
        }
      ]

      // Find matching user
      const user = users.find(u => u.email === formData.email && u.password === formData.password)

      if (user) {
        // Generate a mock JWT token
        const token = 'mock-jwt-token-' + Date.now()
        login(user.userData, token)
      } else {
        setError('Invalid email or password')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back to FrHire
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-2 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-xs sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-2 py-1 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-xs sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              <strong>Demo Student Accounts:</strong><br />
              john@student.com / password (John Smith)<br />
              jane@student.com / password (Jane Doe)<br />
              mike@student.com / password (Mike Johnson)<br />
              <br />
              <strong>Demo Recruiter Account:</strong><br />
              recruiter@example.com / password (Sarah Wilson)
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
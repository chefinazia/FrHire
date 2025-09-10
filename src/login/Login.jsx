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
        {
          email: 'rachit@student.com',
          password: 'password',
          userData: {
            id: 4,
            email: 'rachit@student.com',
            name: 'Rachit Arora',
            userType: 'student',
            coins: 100
          }
        },
        // Recruiter accounts
        {
          email: 'recruiter@example.com',
          password: 'password',
          userData: {
            id: 5,
            email: 'recruiter@example.com',
            name: 'Sarah Wilson',
            userType: 'recruiter'
          }
        }
      ]

      const user = users.find(u => u.email === formData.email && u.password === formData.password)

      if (user) {
        login(user.userData, 'mock-token')
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to FrHire
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Demo Student Accounts:</strong><br />
              john@student.com / password (John Smith)<br />
              jane@student.com / password (Jane Doe)<br />
              mike@student.com / password (Mike Johnson)<br />
              rachit@student.com / password (Rachit Arora)
            </p>
            <p className="text-sm text-gray-600">
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
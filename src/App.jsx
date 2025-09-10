import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ApplicationProvider } from './context/ApplicationContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './login/Login'
import Signup from './signup/Signup'
import StudentDashboard from './components/StudentDashboard'
import RecruiterDashboard from './components/RecruiterDashboard'
import QuickView from './pages/QuickView'
import ReviewApplication from './pages/ReviewApplication'
import ViewReview from './pages/ViewReview'
import PropTypes from 'prop-types'

// Protected Route Component
function ProtectedRoute({ children, allowedUserType }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedUserType && user.userType !== allowedUserType) {
    return <Navigate to={user.userType === 'student' ? '/student' : '/recruiter'} replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedUserType: PropTypes.string.isRequired
}

// Public Route Component (for login/signup)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={user.userType === 'student' ? '/student' : '/recruiter'} replace />
  }

  return children
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
}

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedUserType="student">
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student/review/:applicationId" element={
        <ProtectedRoute allowedUserType="student">
          <ViewReview />
        </ProtectedRoute>
      } />

      {/* Recruiter Routes */}
      <Route path="/recruiter" element={
        <ProtectedRoute allowedUserType="recruiter">
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      <Route path="/recruiter/quickview/:applicationId" element={
        <ProtectedRoute allowedUserType="recruiter">
          <QuickView />
        </ProtectedRoute>
      } />
      <Route path="/recruiter/review/:applicationId" element={
        <ProtectedRoute allowedUserType="recruiter">
          <ReviewApplication />
        </ProtectedRoute>
      } />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ApplicationProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ApplicationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

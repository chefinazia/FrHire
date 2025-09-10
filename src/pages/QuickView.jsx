import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplications } from '../context/ApplicationContext'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const QuickView = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { applications, updateApplicationStatus } = useApplications()
  const { notifyForApplication } = useNotifications()
  const { user } = useAuth()

  const [application, setApplication] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const app = applications.find(a => a.id === parseInt(applicationId))
    if (app) {
      setApplication(app)
      setSelectedStatus(app.status || 'Applied')
      setNotes(app.notes || '')
    } else {
      navigate('/recruiter')
    }
  }, [applicationId, applications, navigate])

  const handleStatusUpdate = async () => {
    setIsUpdating(true)

    try {
      updateApplicationStatus(application.id, selectedStatus, notes, user?.name)

      // Send WebSocket notification to student instantly
      notifyForApplication('status_update', {
        application: { ...application, status: selectedStatus },
        status: selectedStatus
      })

      // Show success feedback
      alert(`Status updated to "${selectedStatus}" and student has been notified!`)

      // Go back to recruiter dashboard
      navigate('/recruiter')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-yellow-100 text-yellow-800'
      case 'Interview Scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'Under Review':
        return 'bg-purple-100 text-purple-800'
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/recruiter')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Application Quick View</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Application Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{application.name || 'Student Name'}</h2>
              <p className="text-gray-600">{application.email || 'student@example.com'}</p>
              <p className="text-sm text-gray-500">Applied for: {application.jobTitle}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>

          {/* Application Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Candidate Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="text-sm text-gray-900">{application.experience || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Education</dt>
                  <dd className="text-sm text-gray-900">{application.education || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{application.location || 'Not specified'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                  <dd className="text-sm text-gray-900">{application.appliedDate}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(application.skills || ['React', 'JavaScript', 'Node.js']).map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Application Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    // Send notes update notification if notes changed significantly
                    if (e.target.value.length > (application.notes || '').length + 10) {
                      notifyForApplication('notes_added', {
                        application
                      })
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this application... (Student will be notified of significant changes)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => navigate('/recruiter')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Status & Notify Student'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickView

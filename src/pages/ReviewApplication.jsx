import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplications } from '../context/ApplicationContext'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const ReviewApplication = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { applications, updateApplicationStatus } = useApplications()
  const { notifyForApplication } = useNotifications()
  const { user } = useAuth()

  const [application, setApplication] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const app = applications.find(a => a.id === parseInt(applicationId))
    if (app) {
      setApplication(app)
      setSelectedStatus(app.status || 'Applied')
      setNotes(app.notes || '')
      setFeedback(app.feedback || '')
      setRating(app.rating || 0)
    } else {
      navigate('/recruiter')
    }
  }, [applicationId, applications, navigate])

  const handleStatusUpdate = async () => {
    setIsUpdating(true)

    try {
      // Update application status with enhanced review data
      updateApplicationStatus(application.id, selectedStatus, notes, user?.name, {
        feedback,
        rating,
        reviewedBy: user?.name,
        reviewedDate: new Date().toISOString().split('T')[0]
      })

      // Send instant WebSocket notification to student
      notifyForApplication('review_received', {
        application: { ...application, rating, feedback },
        recruiterName: user?.name,
        rating,
        feedback
      })

      // Show success feedback
      alert(`Review submitted successfully! ${application.name || 'Student'} has been notified instantly.`)

      // Go back to recruiter dashboard
      navigate('/recruiter')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Not Rated'
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
              <h1 className="text-xl font-bold text-gray-900">Review Application</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{application.name || 'Student Name'}</h2>
                <p className="text-gray-600">{application.email || 'student@example.com'}</p>
                <p className="text-sm text-gray-500">Applied for: {application.jobTitle} • {application.appliedDate}</p>
              </div>
              {application.rating > 0 && (
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${star <= application.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({application.rating}/5)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Previously reviewed</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Review & Rating
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Documents
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Candidate Information</h3>
                    <dl className="space-y-3">
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
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(application.skills || ['React', 'JavaScript', 'Node.js']).map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {application.reviews && application.reviews.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Review History</h3>
                    <div className="space-y-3">
                      {application.reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{review.reviewedBy}</span>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.reviewedDate}</span>
                            </div>
                          </div>
                          <p className="text-gray-700">{review.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rating
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {rating > 0 ? `${rating}/5 - ${getRatingText(rating)}` : 'No rating selected'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide detailed feedback about the candidate's qualifications, interview performance, and fit for the role..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Application Status
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
                      Additional Notes
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
                      placeholder="Internal notes about this application... (Student will be notified of significant changes)"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Documents</h3>
                  <p className="text-gray-500">Resume and cover letter would be displayed here.</p>
                  <p className="text-sm text-gray-400 mt-2">(Document viewing feature coming soon)</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => navigate('/recruiter')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || rating === 0}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting Review...</span>
                  </div>
                ) : (
                  `Submit Review & Notify Student${rating === 0 ? ' (Rating Required)' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewApplication

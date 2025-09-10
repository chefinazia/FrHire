import { useState } from 'react'
import PropTypes from 'prop-types'
import { useApplications } from '../context/ApplicationContext'
import { useNotifications } from '../context/NotificationContext'

const ApplicationReview = ({ application, isOpen, onClose, recruiterName }) => {
  const { updateApplicationStatus } = useApplications()
  const { addNotification } = useNotifications()
  const [selectedStatus, setSelectedStatus] = useState(application?.status || 'Applied')
  const [notes, setNotes] = useState(application?.notes || '')
  const [feedback, setFeedback] = useState(application?.feedback || '')
  const [rating, setRating] = useState(application?.rating || 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !application) return null

  const handleStatusUpdate = async () => {
    setIsUpdating(true)

    try {
      // Update application status with enhanced review data
      updateApplicationStatus(application.id, selectedStatus, notes, recruiterName, {
        feedback,
        rating,
        reviewedBy: recruiterName,
        reviewedDate: new Date().toISOString().split('T')[0]
      })

      // Send notification to student
      const notificationTitle = rating > 0
        ? `Review Received: ${application.jobTitle}`
        : `Application Update: ${application.jobTitle}`

      const notificationMessage = rating > 0
        ? `You received a ${rating}/5 star review for your application at ${application.company}. ${feedback ? `Feedback: ${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}` : ''}`
        : `Your application for ${application.jobTitle} at ${application.company} has been ${selectedStatus.toLowerCase()}. ${feedback ? `Feedback: ${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}` : ''}`

      addNotification({
        userId: application.userId || 1,
        type: rating > 0 ? 'review_received' : 'application_update',
        title: notificationTitle,
        message: notificationMessage,
        applicationId: application.id,
        status: selectedStatus,
        rating: rating,
        hasFeedback: !!feedback
      })

      onClose()
    } catch (error) {
      console.error('Error updating application:', error)
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
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      case 'Under Review':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (currentRating, onRatingChange) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
          >
            ★
          </button>
        ))}
      </div>
    )
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

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[9999]"
      onClick={onClose}
    >
      <div
        className="relative top-4 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 shadow-lg rounded-md bg-white max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Application Review: {application.jobTitle}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Applicant: {application.name} • Applied: {application.appliedDate}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Review & Rating
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Documents
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {application.name}</p>
                    <p><span className="font-medium">Email:</span> {application.email}</p>
                    <p><span className="font-medium">Phone:</span> {application.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Job Title:</span> {application.jobTitle}</p>
                    <p><span className="font-medium">Company:</span> {application.company}</p>
                    <p><span className="font-medium">Applied:</span> {application.appliedDate}</p>
                    <p><span className="font-medium">Experience:</span> {application.experience}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    {application.rating > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Rating:</span>
                        <div className="flex items-center space-x-1">
                          {renderStars(application.rating, () => { })}
                          <span className="text-xs text-gray-600">({getRatingText(application.rating)})</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills and Experience */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(application.skills || ['React', 'JavaScript', 'Node.js']).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Experience Summary</h4>
                  <p className="text-gray-700 text-sm">
                    {application.experienceSummary || 'No experience summary provided.'}
                  </p>
                </div>
              </div>

              {/* Previous Reviews */}
              {application.reviews && application.reviews.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Review History</h4>
                  <div className="space-y-3">
                    {application.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{review.reviewedBy}</span>
                            <span className="text-xs text-gray-500">{review.reviewedDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating, () => { })}
                          </div>
                        </div>
                        {review.feedback && (
                          <p className="text-sm text-gray-700">{review.feedback}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              {/* Rating Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Rate This Application</h4>
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
                    {renderStars(rating, setRating)}
                    <p className="text-sm text-gray-600 mt-1">{getRatingText(rating)}</p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Update Application Status</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Internal notes (not shared with applicant)..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Feedback for Applicant</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Provide constructive feedback for the applicant..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Application Documents</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{application.resume || 'resume.pdf'}</p>
                        <p className="text-sm text-gray-500">Resume • PDF • 2.3 MB</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      View
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">cover_letter.pdf</p>
                        <p className="text-sm text-gray-500">Cover Letter • PDF • 1.1 MB</p>
                      </div>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => setActiveTab('review')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Quick Review
              </button>
            </div>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating}
              className={`px-6 py-2 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${selectedStatus === 'Accepted'
                ? 'bg-green-600 hover:bg-green-700'
                : selectedStatus === 'Rejected'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isUpdating ? 'Updating...' : `Update to ${selectedStatus}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

ApplicationReview.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    notes: PropTypes.string,
    feedback: PropTypes.string,
    rating: PropTypes.number,
    userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    jobTitle: PropTypes.string,
    company: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    appliedDate: PropTypes.string,
    experience: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    experienceSummary: PropTypes.string,
    reviews: PropTypes.arrayOf(PropTypes.shape({
      rating: PropTypes.number,
      feedback: PropTypes.string,
      reviewedBy: PropTypes.string,
      reviewedDate: PropTypes.string
    })),
    resume: PropTypes.string
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  recruiterName: PropTypes.string
}

export default ApplicationReview

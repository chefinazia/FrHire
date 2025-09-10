import { useState } from 'react'
import PropTypes from 'prop-types'

const ReviewReceived = ({ application, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !application) return null

  const renderStars = (rating) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            disabled
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
                Company: {application.company} • Applied: {application.appliedDate}
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
                Review Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Review History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Application Status */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Application Status</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                    {application.reviewedBy && (
                      <span className="text-sm text-gray-500">
                        Reviewed by {application.reviewedBy}
                      </span>
                    )}
                  </div>
                  {application.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(application.rating)}
                        <span className="text-sm text-gray-600">({getRatingText(application.rating)})</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Job Title:</span> {application.jobTitle}</p>
                    <p><span className="font-medium">Company:</span> {application.company}</p>
                    <p><span className="font-medium">Applied Date:</span> {application.appliedDate}</p>
                    <p><span className="font-medium">Experience:</span> {application.experience}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Your Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(application.skills || []).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Preview */}
              {application.feedback && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Recruiter Feedback</h4>
                  <p className="text-green-800 text-sm">{application.feedback}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              {/* Rating Section */}
              {application.rating > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Overall Rating</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-gray-900">{application.rating}/5</div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {renderStars(application.rating)}
                      </div>
                      <p className="text-sm text-gray-600">{getRatingText(application.rating)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-yellow-800 text-sm">No rating provided yet. Your application is still being reviewed.</p>
                  </div>
                </div>
              )}

              {/* Feedback Section */}
              {application.feedback ? (
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Detailed Feedback</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{application.feedback}</p>
                  </div>
                  {application.reviewedBy && (
                    <p className="text-sm text-gray-500 mt-3">
                      — {application.reviewedBy}, {application.reviewedDate}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Detailed Feedback</h4>
                  <p className="text-gray-500 text-sm">No detailed feedback provided yet. Check back later for updates.</p>
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-medium text-blue-900 mb-3">Next Steps</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {application.status === 'Applied' && (
                    <p>• Your application has been received and is being reviewed</p>
                  )}
                  {application.status === 'Under Review' && (
                    <p>• Your application is currently being reviewed by our team</p>
                  )}
                  {application.status === 'Interview Scheduled' && (
                    <p>• Congratulations! You&apos;ve been selected for an interview</p>
                  )}
                  {application.status === 'Accepted' && (
                    <p>• Congratulations! You&apos;ve been accepted for this position</p>
                  )}
                  {application.status === 'Rejected' && (
                    <p>• Thank you for your interest. We encourage you to apply for other positions</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h4 className="font-medium text-gray-900">Review History</h4>
              {application.reviews && application.reviews.length > 0 ? (
                <div className="space-y-4">
                  {application.reviews.map((review, index) => (
                    <div key={index} className="bg-white border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewedBy}</p>
                          <p className="text-sm text-gray-500">{review.reviewedDate}</p>
                        </div>
                        {review.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-600 ml-2">({review.rating}/5)</span>
                          </div>
                        )}
                      </div>
                      {review.feedback && (
                        <p className="text-gray-700 text-sm">{review.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 border rounded-lg p-6 text-center">
                  <p className="text-gray-500">No review history available yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
            {application.status === 'Interview Scheduled' && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                View Interview Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

ReviewReceived.propTypes = {
  application: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    jobTitle: PropTypes.string,
    company: PropTypes.string,
    status: PropTypes.string,
    appliedDate: PropTypes.string,
    experience: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    feedback: PropTypes.string,
    reviewedBy: PropTypes.string,
    reviewedDate: PropTypes.string,
    reviews: PropTypes.arrayOf(PropTypes.shape({
      rating: PropTypes.number,
      feedback: PropTypes.string,
      reviewedBy: PropTypes.string,
      reviewedDate: PropTypes.string
    }))
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ReviewReceived

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplications } from '../context/ApplicationContext'
// import { useAuth } from '../context/AuthContext' // Unused

const ViewReview = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { applications } = useApplications()
  // const { user } = useAuth() // Unused

  const [application, setApplication] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const app = applications.find(a => a.id === parseInt(applicationId))
    if (app && (app.rating > 0 || app.feedback)) {
      setApplication(app)
    } else {
      navigate('/student')
    }
  }, [applicationId, applications, navigate])

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading review...</p>
        </div>
      </div>
    )
  }

  const getRatingText = (rating) => {
    switch (rating) {
      case 1: return 'Needs Improvement'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return 'Not Rated'
    }
  }

  const getNextSteps = (rating, status) => {
    if (status === 'Accepted') {
      return [
        'Congratulations! You have been accepted for this position.',
        'Expect to hear from HR regarding next steps and onboarding.',
        'Prepare for your first day by reviewing the company handbook.'
      ]
    } else if (status === 'Rejected') {
      return [
        'Thank you for your interest in this position.',
        'Use the feedback provided to improve future applications.',
        'Consider applying for other positions that match your skills.'
      ]
    } else if (rating >= 4) {
      return [
        'Great job! Your application made a strong impression.',
        'Continue to prepare for potential next round interviews.',
        'Follow up with the recruiter if you haven\'t heard back in a week.'
      ]
    } else if (rating >= 3) {
      return [
        'Your application shows promise with room for improvement.',
        'Consider addressing the feedback points in future applications.',
        'Continue building relevant skills and experience.'
      ]
    } else {
      return [
        'Focus on the areas mentioned in the feedback for improvement.',
        'Consider additional training or certifications in relevant areas.',
        'Practice interview skills and update your resume based on feedback.'
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">Application Review</h1>
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
                <h2 className="text-2xl font-bold text-gray-900">{application.jobTitle}</h2>
                <p className="text-gray-600">Application Review</p>
                <p className="text-sm text-gray-500">Applied on: {application.appliedDate}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-6 h-6 ${star <= application.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">{application.rating}/5 - {getRatingText(application.rating)}</p>
                <p className="text-sm text-gray-500">Reviewed by {application.reviewedBy || 'Recruiter'}</p>
              </div>
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
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Review Details
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Review History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Application Status</h3>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                      application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'Interview Scheduled' ? 'bg-blue-100 text-blue-800' :
                          application.status === 'Under Review' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                      }`}>
                      {application.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Review Summary</h3>
                    <div className="text-sm text-gray-600">
                      <p>Rating: {application.rating}/5 stars</p>
                      <p>Reviewed on: {application.reviewedDate || 'Recently'}</p>
                      <p>Reviewed by: {application.reviewedBy || 'Recruiter'}</p>
                    </div>
                  </div>
                </div>

                {application.feedback && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Feedback Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">
                        {application.feedback.length > 200
                          ? application.feedback.substring(0, 200) + '...'
                          : application.feedback
                        }
                      </p>
                      {application.feedback.length > 200 && (
                        <button
                          onClick={() => setActiveTab('details')}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          Read full feedback →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Detailed Feedback</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
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
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">
                          {getRatingText(application.rating)} ({application.rating}/5)
                        </p>
                        <p className="text-gray-700 whitespace-pre-line">
                          {application.feedback || 'No detailed feedback provided.'}
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                          <p>Reviewed by: {application.reviewedBy || 'Recruiter'}</p>
                          <p>Date: {application.reviewedDate || 'Recently'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Next Steps</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {getNextSteps(application.rating, application.status).map((step, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Review History</h3>

                {application.reviews && application.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {application.reviews.map((review, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-gray-900">{review.reviewedBy}</p>
                            <p className="text-sm text-gray-500">{review.reviewedDate}</p>
                          </div>
                          <div className="flex items-center space-x-1">
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
                            <span className="text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.feedback}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= application.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{application.reviewedBy || 'Recruiter'}</p>
                          <p className="text-sm text-gray-500">{application.reviewedDate || 'Recently'}</p>
                        </div>
                        <p className="text-gray-700">{application.feedback || 'No feedback provided.'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t p-6">
            <div className="flex justify-between">
              <button
                onClick={() => navigate('/student')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ← Back to Dashboard
              </button>

              <div className="space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Print Review
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewReview

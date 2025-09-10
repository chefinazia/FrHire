import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApplications } from '../context/ApplicationContext'
import { useAuth } from '../context/AuthContext'

const QuickView = () => {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { applications, getApplicationByJobId } = useApplications()
  const { user } = useAuth()
  const [application, setApplication] = useState(null)

  useEffect(() => {
    if (applicationId && applications.length > 0) {
      const foundApplication = applications.find(app => app.id === parseInt(applicationId))
      setApplication(foundApplication)
    }
  }, [applicationId, applications])

  const handleGoBack = () => {
    navigate('/recruiter')
  }

  const handleFullReview = () => {
    navigate(`/recruiter/review/${applicationId}`)
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Quick View - {application.name}</h1>
              <button
                onClick={handleGoBack}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {application.name}</p>
                  <p><span className="font-medium">Email:</span> {application.email}</p>
                  <p><span className="font-medium">Phone:</span> {application.phone}</p>
                  <p><span className="font-medium">Experience:</span> {application.experience}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Position:</span> {application.jobTitle}</p>
                  <p><span className="font-medium">Company:</span> {application.company}</p>
                  <p><span className="font-medium">Applied Date:</span> {application.appliedDate}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      application.status === 'Applied' ? 'bg-blue-100 text-blue-800' :
                      application.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'Interview Scheduled' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {application.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application.skills && application.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {application.experienceSummary && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Summary</h3>
                <p className="text-gray-700">{application.experienceSummary}</p>
              </div>
            )}

            {application.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700">{application.notes}</p>
              </div>
            )}

            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleFullReview}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Full Review & Rate
              </button>
              <button
                onClick={handleGoBack}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickView

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApplications } from '../context/ApplicationContext'
import { useNotifications } from '../context/NotificationContext'
import NotificationBell from './NotificationBell'
import ResumeUpload from './ResumeUpload'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { user, logout, updateUserCoins } = useAuth()
  const { applications, applyToJob, getApplicationByJobId } = useApplications()
  const { addNotification } = useNotifications()
  const [activeTab, setActiveTab] = useState('jobs')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [resumeData, setResumeData] = useState(null)
  const [atsAnalysis, setAtsAnalysis] = useState(null)

  const mockJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Remote',
      salary: '$60k - $80k',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'Looking for a skilled frontend developer with React experience.'
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      salary: '$70k - $90k',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our growing team as a backend developer.'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'Design Studio',
      location: 'New York, NY',
      salary: '$50k - $70k',
      type: 'Contract',
      posted: '3 days ago',
      description: 'Creative UI/UX designer needed for mobile app project.'
    }
  ]

  const handleApplyToJob = (job) => {
    const existingApplication = getApplicationByJobId(job.id, user?.id)

    if (existingApplication) {
      alert('You have already applied to this job!')
      return
    }

    applyToJob(job, user)

    // Add instant WebSocket notification for successful application
    addNotification({
      type: 'application_submitted',
      title: 'Application Submitted Successfully!',
      message: `Your application for ${job.title} at ${job.company} has been submitted and recruiters have been notified.`,
      userId: user?.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company
    })

    setShowSuccessMessage(true)

    // Hide success message after 5 seconds (extended for better UX)
    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 5000)
  }

  const handleViewReview = (application) => {
    navigate(`/student/review/${application.id}`)
  }

  const handleResumeAnalyzed = (resume, analysis) => {
    setResumeData(resume)
    setAtsAnalysis(analysis)
  }

  const handleCoinsUpdate = (coinsEarned) => {
    updateUserCoins(coinsEarned)
  }

  const mockProfile = {
    name: user?.name || 'Student Name',
    email: user?.email || 'student@example.com',
    skills: ['React', 'JavaScript', 'Node.js', 'Python'],
    experience: '2 years',
    education: 'Computer Science',
    location: 'San Francisco, CA'
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FrHire - Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              {user?.userType === 'student' && (
                <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1">
                  <span className="text-xl">🪙</span>
                  <span className="text-sm font-medium text-yellow-800">
                    {user?.coins || 0} coins
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'jobs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Job Listings
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'applications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'resume'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              📄 Resume & ATS Analysis
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Jobs</h2>

            {/* Success Message */}
            {showSuccessMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Application submitted successfully!</span>
                </div>
                <p className="mt-1 text-xs">Recruiters have been notified via WebSocket. Check &quot;My Applications&quot; to track progress.</p>
              </div>
            )}

            <div className="grid gap-6">
              {mockJobs.map((job) => {
                const existingApplication = getApplicationByJobId(job.id)
                const isApplied = !!existingApplication

                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          {isApplied && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Applied
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{job.company} • {job.location}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.salary} • {job.type} • {job.posted}</p>
                        <p className="text-gray-700 mt-2">{job.description}</p>
                        {isApplied && (
                          <p className="text-sm text-green-600 mt-2">
                            Applied on {existingApplication.appliedDate} • Status: {existingApplication.status}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        {isApplied ? (
                          <button
                            disabled
                            className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                          >
                            ✓ Already Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyToJob(job)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            🚀 Apply Now (Instant Notify)
                          </button>
                        )}
                        {isApplied && (
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                          >
                            View Application
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">Start applying to jobs to see your applications here.</p>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{app.jobTitle}</h3>
                        <p className="text-gray-600">{app.company}</p>
                        <p className="text-sm text-gray-500">Applied: {app.appliedDate}</p>
                        <p className="text-sm text-gray-600 mt-1">{app.notes}</p>

                        {/* Review Information */}
                        {app.rating > 0 && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm font-medium text-green-800">Review Received!</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= app.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-green-600">({app.rating}/5)</span>
                            </div>
                            {app.feedback && (
                              <p className="text-sm text-green-700 line-clamp-2">{app.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${app.status === 'Applied'
                          ? 'bg-yellow-100 text-yellow-800'
                          : app.status === 'Interview Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : app.status === 'Under Review'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : app.status === 'Rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}>
                          {app.status}
                        </span>
                        {(app.rating > 0 || app.feedback || app.reviewedBy) && (
                          <button
                            onClick={() => handleViewReview(app)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            View Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Resume & ATS Analysis</h2>
              <div className="text-sm text-gray-500">
                💡 Upload your resume to get ATS compatibility analysis and earn coins!
              </div>
            </div>

            <ResumeUpload
              onResumeAnalyzed={handleResumeAnalyzed}
              onCoinsUpdate={handleCoinsUpdate}
            />

            {/* Resume Statistics */}
            {resumeData && atsAnalysis && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resume Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{atsAnalysis.score}%</div>
                    <div className="text-sm text-blue-800">ATS Score</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{atsAnalysis.totalKeywords}</div>
                    <div className="text-sm text-green-800">Keywords Found</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">50</div>
                    <div className="text-sm text-yellow-800">Coins Earned</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips for ATS Optimization */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 ATS Optimization Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">✅ Best Practices</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use standard section headings (Experience, Education, Skills)</li>
                    <li>• Include relevant keywords from job descriptions</li>
                    <li>• Use standard fonts (Arial, Calibri, Times New Roman)</li>
                    <li>• Save as PDF to preserve formatting</li>
                    <li>• Include measurable achievements with numbers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">❌ Common Mistakes</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Using images, graphics, or unusual formatting</li>
                    <li>• Creative section names that ATS can&apos;t recognize</li>
                    <li>• Missing contact information</li>
                    <li>• No relevant keywords for your industry</li>
                    <li>• Text in headers/footers (often not parsed)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{mockProfile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{mockProfile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{mockProfile.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience</label>
                      <p className="text-gray-900">{mockProfile.experience}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Education</label>
                      <p className="text-gray-900">{mockProfile.education}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockProfile.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default StudentDashboard

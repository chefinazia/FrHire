import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApplications } from '../context/ApplicationContext'
import { useNotifications } from '../context/NotificationContext'
// import NotificationBell from './NotificationBell' // Unused - NotificationBell is in header

const RecruiterDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const {
    applications,
    updateApplicationStatus,
    getApplicationsByStatus,
    getApplicationsNeedingReview,
    getReviewStats
  } = useApplications()
  const { notifyForApplication } = useNotifications()
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviewFilter, setReviewFilter] = useState('all')
  const [quickNote, setQuickNote] = useState('')
  const [selectedAppForNote, setSelectedAppForNote] = useState(null)

  const mockJobPostings = [
    {
      id: 1,
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      salary: '$60k - $80k',
      type: 'Full-time',
      status: 'Active',
      applicants: 15,
      posted: '2024-01-15',
      description: 'Looking for a skilled frontend developer with React experience.'
    },
    {
      id: 2,
      title: 'Backend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      salary: '$70k - $90k',
      type: 'Full-time',
      status: 'Active',
      applicants: 8,
      posted: '2024-01-10',
      description: 'Join our growing team as a backend developer.'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'New York, NY',
      salary: '$50k - $70k',
      type: 'Contract',
      status: 'Closed',
      applicants: 12,
      posted: '2024-01-05',
      description: 'Creative UI/UX designer needed for mobile app project.'
    }
  ]

  // Using real application data from context instead of mock data

  const mockCompanyProfile = {
    name: 'Tech Corp',
    industry: 'Technology',
    size: '50-200 employees',
    location: 'San Francisco, CA',
    website: 'www.techcorp.com',
    description: 'We are a leading technology company focused on innovation and growth.'
  }

  const handleViewApplication = (application) => {
    // Add quick action notification to student
    notifyForApplication('status_update', {
      application,
      status: 'Under Review'
    })

    navigate(`/recruiter/quickview/${application.id}`)
  }

  const handleReviewApplication = (application) => {
    // Add review initiation notification to student
    notifyForApplication('status_update', {
      application,
      status: 'Under Review'
    })

    navigate(`/recruiter/review/${application.id}`)
  }

  const handleQuickNote = (application) => {
    setSelectedAppForNote(application)
    setQuickNote(application.notes || '')
  }

  const submitQuickNote = () => {
    if (selectedAppForNote && quickNote.trim()) {
      updateApplicationStatus(selectedAppForNote.id, selectedAppForNote.status, quickNote, user?.name)

      // Send notification about notes addition
      notifyForApplication('notes_added', {
        application: selectedAppForNote
      })

      setSelectedAppForNote(null)
      setQuickNote('')
      alert(`Note added and ${selectedAppForNote.name || 'student'} has been notified!`)
    }
  }


  const getApplicationsByJobId = (jobId) => {
    return applications.filter(app => app.jobId === jobId)
  }

  const getTotalApplicants = () => {
    return applications.length
  }

  const getInterviewScheduled = () => {
    return applications.filter(app => app.status === 'Interview Scheduled').length
  }

  const getHired = () => {
    return applications.filter(app => app.status === 'Accepted').length
  }

  const getFilteredApplications = () => {
    switch (reviewFilter) {
      case 'pending':
        return getApplicationsNeedingReview()
      case 'high-rated':
        return applications.filter(app => (app.rating || 0) >= 4)
      case 'interview':
        return getApplicationsByStatus('Interview Scheduled')
      case 'accepted':
        return getApplicationsByStatus('Accepted')
      case 'rejected':
        return getApplicationsByStatus('Rejected')
      default:
        return applications
    }
  }

  const reviewStats = getReviewStats()

  const properCase = (str) => {
    if (!str || typeof str !== 'string') return 'Student Name'
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
  }

  const getDisplayName = (application) => {
    if (!application) return 'Student Name'
    switch (application.userId) {
      case 1:
        return 'John Smith'
      case 2:
        return 'Jane Doe'
      case 3:
        return 'Mike Johnson'
      default:
        return properCase(application.name || 'Student Name')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FrHire - Recruiter Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{mockJobPostings.filter(job => job.status === 'Active').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                <p className="text-2xl font-semibold text-gray-900">{getTotalApplicants()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Interviews</p>
                <p className="text-2xl font-semibold text-gray-900">{getInterviewScheduled()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Hired</p>
                <p className="text-2xl font-semibold text-gray-900">{getHired()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{reviewStats.pendingReview}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('postings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'postings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Job Postings
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'applicants'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Applicants
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'company'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Company Profile
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'postings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Post New Job
              </button>
            </div>
            <div className="grid gap-6">
              {mockJobPostings.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{job.department} • {job.location}</p>
                      <p className="text-sm text-gray-500 mt-1">{job.salary} • {job.type} • {getApplicationsByJobId(job.id).length} applicants</p>
                      <p className="text-gray-700 mt-2">{job.description}</p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors">
                        Edit
                      </button>
                      <button className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                        View Applicants
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'applicants' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">Applications will appear here when students apply to your job postings.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{application.name || 'Student Name'}</h3>
                        <p className="text-gray-600">{application.email || 'student@example.com'}</p>
                        <p className="text-sm text-gray-500">Applied for: {application.jobTitle} • {application.appliedDate}</p>
                        <p className="text-sm text-gray-600 mt-1">Experience: {application.experience || 'Not specified'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(application.skills || ['React', 'JavaScript', 'Node.js']).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === 'Applied'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'Interview Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : application.status === 'Under Review'
                              ? 'bg-purple-100 text-purple-800'
                              : application.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                          {application.status}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            🔍 Quick View
                          </button>
                          <button
                            onClick={() => handleReviewApplication(application)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            ⭐ Review
                          </button>
                          <button
                            onClick={() => handleQuickNote(application)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            📝 Note & Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Application Reviews</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending Review</option>
                  <option value="high-rated">High Rated (4+ stars)</option>
                  <option value="interview">Interview Scheduled</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Reviewed</p>
                    <p className="text-2xl font-semibold text-gray-900">{reviewStats.reviewed}</p>
                    <p className="text-xs text-gray-500">of {reviewStats.total} total</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Average Rating</p>
                    <p className="text-2xl font-semibold text-gray-900">{reviewStats.avgRating}</p>
                    <p className="text-xs text-gray-500">out of 5 stars</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">High Rated</p>
                    <p className="text-2xl font-semibold text-gray-900">{reviewStats.highRated}</p>
                    <p className="text-xs text-gray-500">4+ star applications</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Applications List */}
            {getFilteredApplications().length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">No applications match the current filter criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {getFilteredApplications().map((application) => (
                  <div key={application.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{getDisplayName(application)}</h3>
                          {application.rating > 0 && (
                            <div className="flex items-center space-x-1">
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
                              <span className="text-sm text-gray-600">({application.rating}/5)</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600">{application.email || 'student@example.com'}</p>
                        <p className="text-sm text-gray-500">Applied for: {application.jobTitle} • {application.appliedDate}</p>
                        <p className="text-sm text-gray-600 mt-1">Experience: {application.experience || 'Not specified'}</p>

                        {application.feedback && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Feedback:</span> {application.feedback}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-2">
                          {(application.skills || ['React', 'JavaScript', 'Node.js']).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${application.status === 'Applied'
                          ? 'bg-yellow-100 text-yellow-800'
                          : application.status === 'Interview Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : application.status === 'Under Review'
                              ? 'bg-purple-100 text-purple-800'
                              : application.status === 'Accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                          {application.status}
                        </span>
                        {application.reviewedBy && (
                          <p className="text-xs text-gray-500">Reviewed by {application.reviewedBy}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewApplication(application)}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-gray-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            🔍 Quick View
                          </button>
                          <button
                            onClick={() => handleReviewApplication(application)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            {application.reviewedBy ? '✨ Update Review' : '⭐ Review'}
                          </button>
                          <button
                            onClick={() => handleQuickNote(application)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-all transform hover:scale-105 active:scale-95"
                          >
                            📝 Note & Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'company' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Name</label>
                      <p className="text-gray-900">{mockCompanyProfile.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Industry</label>
                      <p className="text-gray-900">{mockCompanyProfile.industry}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company Size</label>
                      <p className="text-gray-900">{mockCompanyProfile.size}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{mockCompanyProfile.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <p className="text-blue-600">{mockCompanyProfile.website}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700">{mockCompanyProfile.description}</p>
                  <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                    Edit Company Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Note Modal */}
      {selectedAppForNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Note for {selectedAppForNote.name || 'Student'}</h3>
            <textarea
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add your note here... (Student will be notified instantly via WebSocket)"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setSelectedAppForNote(null)
                  setQuickNote('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitQuickNote}
                disabled={!quickNote.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                🚀 Add Note & Notify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default RecruiterDashboard

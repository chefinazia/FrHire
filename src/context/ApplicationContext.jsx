import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const ApplicationContext = createContext()

export const useApplications = () => {
  const context = useContext(ApplicationContext)
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider')
  }
  return context
}

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([])

  useEffect(() => {
    // Load applications from localStorage on mount
    const savedApplications = localStorage.getItem('applications')
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications))
    } else {
      // Add some sample applications for testing
      const sampleApplications = [
        {
          id: 1,
          jobId: 1,
          jobTitle: 'Frontend Developer',
          company: 'Tech Corp',
          name: 'John Smith',
          email: 'john@student.com',
          phone: '+1-555-0123',
          status: 'Applied',
          appliedDate: '2024-01-16',
          experience: '3 years',
          skills: ['React', 'JavaScript', 'CSS', 'HTML'],
          experienceSummary: 'Experienced frontend developer with strong React skills and modern web development practices.',
          notes: 'Application submitted successfully',
          resume: 'john_smith_resume.pdf',
          userId: 1
        },
        {
          id: 2,
          jobId: 1,
          jobTitle: 'Frontend Developer',
          company: 'Tech Corp',
          name: 'Jane Doe',
          email: 'jane@student.com',
          phone: '+1-555-0124',
          status: 'Interview Scheduled',
          appliedDate: '2024-01-15',
          experience: '2 years',
          skills: ['Vue.js', 'TypeScript', 'SASS', 'Node.js'],
          experienceSummary: 'Passionate developer with experience in Vue.js and modern JavaScript frameworks.',
          notes: 'Strong technical background',
          resume: 'jane_doe_resume.pdf',
          userId: 2,
          rating: 4,
          feedback: 'Excellent technical skills and good communication.',
          reviewedBy: 'Sarah Johnson',
          reviewedDate: '2024-01-17'
        },
        {
          id: 3,
          jobId: 2,
          jobTitle: 'Backend Developer',
          company: 'Tech Corp',
          name: 'Mike Johnson',
          email: 'mike@student.com',
          phone: '+1-555-0125',
          status: 'Under Review',
          appliedDate: '2024-01-14',
          experience: '4 years',
          skills: ['Node.js', 'Python', 'AWS', 'Docker'],
          experienceSummary: 'Senior backend developer with extensive experience in scalable systems.',
          notes: 'Under review by technical team',
          resume: 'mike_johnson_resume.pdf',
          userId: 3
        }
      ]
      setApplications(sampleApplications)
      localStorage.setItem('applications', JSON.stringify(sampleApplications))

      // Clear any existing sample notifications to show only real ones
      localStorage.removeItem('notifications')
    }
  }, [])

  const applyToJob = (job, currentUser) => {
    const newApplication = {
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      userId: currentUser?.id,
      name: currentUser?.name || 'Student',
      email: currentUser?.email || 'student@example.com',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: 'Application submitted successfully'
    }

    const updatedApplications = [...applications, newApplication]
    setApplications(updatedApplications)
    localStorage.setItem('applications', JSON.stringify(updatedApplications))

    return newApplication
  }

  const updateApplicationStatus = (applicationId, newStatus, notes = '', recruiterName = '', reviewData = {}) => {
    const updatedApplications = applications.map(app =>
      app.id === applicationId
        ? {
          ...app,
          status: newStatus,
          notes: notes || app.notes,
          recruiterName: recruiterName || app.recruiterName,
          statusUpdatedDate: new Date().toISOString().split('T')[0],
          // Enhanced review data
          rating: reviewData.rating || app.rating || 0,
          feedback: reviewData.feedback || app.feedback || '',
          reviewedBy: reviewData.reviewedBy || app.reviewedBy || '',
          reviewedDate: reviewData.reviewedDate || app.reviewedDate || '',
          // Add to review history
          reviews: [
            ...(app.reviews || []),
            ...(reviewData.rating || reviewData.feedback ? [{
              rating: reviewData.rating || 0,
              feedback: reviewData.feedback || '',
              reviewedBy: reviewData.reviewedBy || '',
              reviewedDate: reviewData.reviewedDate || new Date().toISOString().split('T')[0]
            }] : [])
          ]
        }
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('applications', JSON.stringify(updatedApplications))
  }

  const getApplicationByJobId = (jobId, userId) => {
    if (userId == null) return applications.find(app => app.jobId === jobId)
    return applications.find(app => app.jobId === jobId && app.userId === userId)
  }

  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status)
  }

  const getApplicationsByRating = (minRating) => {
    return applications.filter(app => (app.rating || 0) >= minRating)
  }

  const getApplicationsNeedingReview = () => {
    return applications.filter(app =>
      app.status === 'Applied' ||
      app.status === 'Under Review' ||
      !app.reviewedBy
    )
  }

  const getReviewStats = () => {
    const total = applications.length
    const reviewed = applications.filter(app => app.reviewedBy).length
    const avgRating = applications.reduce((sum, app) => sum + (app.rating || 0), 0) / total || 0
    const highRated = applications.filter(app => (app.rating || 0) >= 4).length

    return {
      total,
      reviewed,
      pendingReview: total - reviewed,
      avgRating: Math.round(avgRating * 10) / 10,
      highRated
    }
  }

  const value = {
    applications,
    applyToJob,
    updateApplicationStatus,
    getApplicationByJobId,
    getApplicationsByStatus,
    getApplicationsByRating,
    getApplicationsNeedingReview,
    getReviewStats
  }

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  )
}

ApplicationProvider.propTypes = {
  children: PropTypes.node.isRequired
}

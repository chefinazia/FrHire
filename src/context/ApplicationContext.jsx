import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import apiClient from '../api/client.js'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load applications from API on mount
    const loadApplications = async () => {
      try {
        const dbApplications = await apiClient.getApplications()
        setApplications(dbApplications)
      } catch (error) {
        console.error('Error loading applications:', error)
        setApplications([])
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [])

  const applyToJob = async (job, currentUser) => {
    try {
      const newApplication = {
        job_id: job.id,
        job_title: job.title,
        company: job.company,
        user_id: currentUser?.id,
        name: currentUser?.name || 'Student',
        email: currentUser?.email || 'student@example.com',
        status: 'Applied',
        applied_date: new Date().toISOString().split('T')[0],
        notes: 'Application submitted successfully',
        skills: JSON.stringify([])
      }

      const createdApplication = await apiClient.createApplication(newApplication)
      const updatedApplications = [...applications, createdApplication]
      setApplications(updatedApplications)

      return createdApplication
    } catch (error) {
      console.error('Error applying to job:', error)
      throw error
    }
  }

  const updateApplicationStatus = async (applicationId, newStatus, notes = '', recruiterName = '', reviewData = {}) => {
    try {
      const updates = {
        status: newStatus,
        notes: notes,
        rating: reviewData.rating || null,
        feedback: reviewData.feedback || null,
        reviewed_by: reviewData.reviewedBy || recruiterName || null,
        reviewed_date: reviewData.reviewedDate || new Date().toISOString().split('T')[0]
      }

      // Remove null values
      Object.keys(updates).forEach(key => {
        if (updates[key] === null) {
          delete updates[key]
        }
      })

      await apiClient.updateApplication(applicationId, updates)

      // Refresh applications from API
      const dbApplications = await apiClient.getApplications()
      setApplications(dbApplications)
    } catch (error) {
      console.error('Error updating application status:', error)
      throw error
    }
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
    loading,
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

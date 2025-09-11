import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'
import apiClient from '../api/client.js'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const wsRef = useRef(null)
  const channelRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const hasTriedRef = useRef(false)

  useEffect(() => {
    // Load notifications from API on mount
    const loadNotifications = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'))
        if (userData && userData.id) {
          const dbNotifications = await apiClient.getNotificationsByUserId(userData.id)
          setNotifications(dbNotifications)
        }
      } catch (error) {
        console.error('Error loading notifications:', error)
        setNotifications([])
      }
    }

    loadNotifications()

    // Sync across tabs via storage events
    const onStorage = (e) => {
      if (e.key === 'userData') {
        // Reload notifications when user changes
        loadNotifications()
      }
    }
    window.addEventListener('storage', onStorage)

    // Sync across tabs via BroadcastChannel (if supported)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channelRef.current = new BroadcastChannel('notifications')
      channelRef.current.onmessage = (event) => {
        const data = event?.data
        if (!data) return
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
        } else if (data.notification) {
          setNotifications((prev) => [...prev, data.notification])
        }
      }
    }

    // WebSocket client with simple auto-reconnect
    const connectWS = () => {
      try {
        const userDataRaw = localStorage.getItem('userData')
        const userData = userDataRaw ? JSON.parse(userDataRaw) : null
        const userId = userData?.id
        const port = (import.meta?.env?.VITE_WS_PORT) || 5178
        const ws = new WebSocket(`ws://localhost:${port}`)
        wsRef.current = ws
        ws.addEventListener('open', () => {
          hasTriedRef.current = true
          if (userId) {
            ws.send(JSON.stringify({ type: 'auth', userId }))
          }
        })
        ws.addEventListener('close', () => {
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
          // retry after 2s
          reconnectTimerRef.current = setTimeout(connectWS, 2000)
        })
        ws.addEventListener('error', (error) => {
          console.warn('WebSocket error:', error)
          try { ws.close() } catch (closeError) {
            console.warn('Failed to close WebSocket on error:', closeError)
          }
        })
        ws.addEventListener('message', (evt) => {
          try {
            const msg = JSON.parse(evt.data)
            if (msg.type === 'notification' && msg.notification) {
              const incoming = {
                id: Date.now(),
                ...msg.notification,
                timestamp: new Date().toISOString(),
                read: false
              }
              setNotifications((prev) => {
                const updated = [...prev, incoming]
                localStorage.setItem('notifications', JSON.stringify(updated))
                return updated
              })
            }
          } catch (error) {
            console.warn('Failed to parse WebSocket message:', error)
          }
        })
      } catch (error) {
        console.warn('Failed to establish WebSocket connection:', error)
      }
    }
    connectWS()

    return () => {
      window.removeEventListener('storage', onStorage)
      if (channelRef.current) {
        channelRef.current.close()
      }
      if (wsRef.current) {
        try { wsRef.current.close() } catch (error) {
          console.warn('Failed to close WebSocket on cleanup:', error)
        }
      }
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    }
  }, [])

  const addNotification = useCallback(async (notification) => {
    try {
      const newNotification = {
        user_id: notification.userId || notification.toUserId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        application_id: notification.applicationId || null,
        status: notification.status || null,
        rating: notification.rating || null,
        has_feedback: notification.hasFeedback || false,
        is_read: false
      }

      const createdNotification = await apiClient.createNotification(newNotification)

      setNotifications(prev => [createdNotification, ...prev])

      // Broadcast to other tabs
      if (channelRef.current) {
        channelRef.current.postMessage({ notification: createdNotification })
      }

      // Also try server push to target user if toUserId provided
      if (wsRef.current && notification.toUserId != null) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'notify', toUserId: notification.toUserId, notification: createdNotification }))
        } catch (error) {
          console.warn('Failed to send WebSocket notification:', error)
        }
      }

      return createdNotification
    } catch (error) {
      console.error('Error adding notification:', error)
      throw error
    }
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
      setNotifications(updatedNotifications)
      if (channelRef.current) {
        channelRef.current.postMessage({ notification: { id: notificationId, is_read: true } })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [notifications])

  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }))
    setNotifications(updatedNotifications)
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications))
    if (channelRef.current) {
      channelRef.current.postMessage({ notifications: updatedNotifications })
    }
  }, [notifications])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.is_read).length
  }, [notifications])

  const getNotificationsByUserId = useCallback((userId) => {
    return notifications.filter(notification => notification.userId === userId)
  }, [notifications])

  const buildNotificationTemplate = useCallback((kind, { application, recruiterName, status, rating, feedback } = {}) => {
    const jobTitle = application?.jobTitle || 'the position'
    switch (kind) {
      case 'review_received': {
        const safeRating = typeof rating === 'number' ? rating : (application?.rating || 0)
        return {
          type: 'review_received',
          title: `New review from ${recruiterName || 'Recruiter'}`,
          message: `Your application for ${jobTitle} was reviewed. Rating: ${safeRating}/5.${feedback ? ' Feedback: ' + feedback : ''}`,
          rating: safeRating,
          feedback: feedback || application?.feedback || '',
          applicationId: application?.id,
          userId: application?.userId,
          toUserId: application?.userId
        }
      }
      case 'status_update': {
        const s = status || application?.status || 'Updated'
        let title = 'Application status updated'
        if (s === 'Interview Scheduled') title = 'Interview scheduled'
        if (s === 'Accepted') title = 'Congratulations! You were accepted'
        if (s === 'Rejected') title = 'Application decision: Rejected'
        if (s === 'Under Review') title = 'Application moved to Under Review'
        return {
          type: 'status_update',
          title,
          message: `Your application for ${jobTitle} is now: ${s}.`,
          status: s,
          applicationId: application?.id,
          userId: application?.userId,
          toUserId: application?.userId
        }
      }
      case 'notes_added': {
        return {
          type: 'notes_added',
          title: 'New note added by recruiter',
          message: `A new note was added to your application for ${jobTitle}.`,
          applicationId: application?.id,
          userId: application?.userId,
          toUserId: application?.userId
        }
      }
      default:
        return {
          type: 'application_update',
          title: 'Application updated',
          message: `There is a new update on your application for ${jobTitle}.`,
          applicationId: application?.id,
          userId: application?.userId,
          toUserId: application?.userId
        }
    }
  }, [])

  const notifyForApplication = useCallback((kind, params) => {
    const n = (typeof kind === 'object' ? kind : null) || ({});
    const template = n.type ? n : (typeof kind === 'string' ? buildNotificationTemplate(kind, params) : null)
    if (!template) return null
    return addNotification(template)
  }, [buildNotificationTemplate, addNotification])

  const value = useMemo(() => ({
    notifications,
    addNotification,
    buildNotificationTemplate,
    notifyForApplication,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    getNotificationsByUserId
  }), [notifications, addNotification, buildNotificationTemplate, notifyForApplication, markAsRead, markAllAsRead, getUnreadCount, getNotificationsByUserId])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
}

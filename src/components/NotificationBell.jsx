import { useState } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'

const NotificationBell = () => {
  const { getNotificationsByUserId, markAsRead, markAllAsRead } = useNotifications()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const userNotifications = getNotificationsByUserId(user?.id || 1)
  const unreadCount = userNotifications.filter(n => !n.read).length
  const sortedNotifications = userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const displayNotifications = showAll ? sortedNotifications : sortedNotifications.slice(0, 5)


  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
        aria-label="Open notifications"
      >
        {/* Modern bell with ringing lines */}
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 19a2 2 0 11-4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 8a6 6 0 1112 0v4l1.5 2.5c.3.5-.07 1.5-.75 1.5H5.25c-.68 0-1.05-1-.75-1.5L6 12V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 8c0-1.5.5-3 1.5-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 8c0-1.5-.5-3-1.5-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
              {unreadCount}
            </span>
            {/* Ping indicator */}
            <span className="absolute -top-1 -right-1 inline-flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Scrollable notification list */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {userNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <p className="font-medium">No notifications yet</p>
                <p className="text-xs mt-1">You&apos;ll see updates here when recruiters take action</p>
              </div>
            ) : (
              <>
                {/* Scroll indicator at top */}
                {userNotifications.length > 3 && (
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-b">
                    📜 Scroll to see {userNotifications.length} notifications
                  </div>
                )}
                <div className="divide-y divide-gray-100">
                  {displayNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${!notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {notification.type === 'review_received' ? (
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                              {/* Star */}
                              <svg className="w-4 h-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          ) : notification.type === 'application_submitted' ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              {/* Paper plane */}
                              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3.4 2.9l17.5 8.2c.9.4.9 1.7 0 2.1L3.4 21.4c-.8.4-1.7-.4-1.4-1.3l2.6-7.1c.1-.3.4-.5.7-.6l7.9-1.4c.3 0 .3-.5 0-.6L5.3 8.9c-.3-.1-.5-.3-.6-.6L2 2.6c-.3-.8.6-1.6 1.4-1.2z" />
                              </svg>
                            </div>
                          ) : notification.type === 'resume_uploaded' ? (
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              {/* Document with coins */}
                              <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                                <path d="M14 2v6h6" />
                                <circle cx="10" cy="12" r="2" fill="#FFD700" />
                              </svg>
                            </div>
                          ) : notification.status === 'Accepted' ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              {/* Check */}
                              <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : notification.status === 'Rejected' ? (
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              {/* X */}
                              <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              {/* Calendar */}
                              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatTime(notification.timestamp)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show more/less button */}
                {userNotifications.length > 5 && (
                  <div className="p-3 border-t bg-gray-50">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {showAll ? `↑ Show Less` : `↓ Show ${userNotifications.length - 5} More Notifications`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell

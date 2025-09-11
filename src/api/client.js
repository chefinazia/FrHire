// API client for communicating with the backend server
const API_BASE_URL = 'http://localhost:3002/api'

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Request failed')
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Auth methods
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async signup(email, name, password, userType) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, userType })
    })
  }

  async getUser(id) {
    return this.request(`/auth/user/${id}`)
  }

  async updateUserCoins(id, coins) {
    return this.request(`/auth/user/${id}/coins`, {
      method: 'PUT',
      body: JSON.stringify({ coins })
    })
  }

  // Application methods
  async getApplications() {
    return this.request('/applications')
  }

  async getApplicationsByUserId(userId) {
    return this.request(`/applications/user/${userId}`)
  }

  async createApplication(applicationData) {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    })
  }

  async updateApplication(id, updates) {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  async getApplicationById(id) {
    return this.request(`/applications/${id}`)
  }

  // Notification methods
  async getNotificationsByUserId(userId) {
    return this.request(`/notifications/user/${userId}`)
  }

  async createNotification(notificationData) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData)
    })
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT'
    })
  }

  // Resume upload methods
  async getResumeUploadsByUserId(userId) {
    return this.request(`/resume-uploads/user/${userId}`)
  }

  async createResumeUpload(uploadData) {
    return this.request('/resume-uploads', {
      method: 'POST',
      body: JSON.stringify(uploadData)
    })
  }

  // Health check
  async healthCheck() {
    return this.request('/health')
  }
}

export default new ApiClient()

import express from 'express'
import cors from 'cors'
import database from '../database/database.js'

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database
await database.connect()

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await database.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // In a real app, you'd verify the password hash
    // For now, we'll just return the user
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        coins: user.coins
      },
      token: 'mock-jwt-token-' + Date.now()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, name, password, userType } = req.body

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create new user
    const user = await database.createUser({
      email,
      name,
      user_type: userType || 'student',
      coins: userType === 'student' ? 100 : 0
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        coins: user.coins
      },
      token: 'mock-jwt-token-' + Date.now()
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/auth/user/:id', async (req, res) => {
  try {
    const user = await database.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      coins: user.coins
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/auth/user/:id/coins', async (req, res) => {
  try {
    const { coins } = req.body
    await database.updateUser(req.params.id, { coins })

    const user = await database.getUserById(req.params.id)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.user_type,
      coins: user.coins
    })
  } catch (error) {
    console.error('Update coins error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Application routes
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await database.getAllApplications()
    res.json(applications)
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const applications = await database.getApplicationsByUserId(req.params.userId)
    res.json(applications)
  } catch (error) {
    console.error('Get user applications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/applications', async (req, res) => {
  try {
    const application = await database.createApplication(req.body)
    res.json(application)
  } catch (error) {
    console.error('Create application error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/applications/:id', async (req, res) => {
  try {
    await database.updateApplication(req.params.id, req.body)
    const application = await database.getApplicationById(req.params.id)
    res.json(application)
  } catch (error) {
    console.error('Update application error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Notification routes
app.get('/api/notifications/user/:userId', async (req, res) => {
  try {
    const notifications = await database.getNotificationsByUserId(req.params.userId)
    res.json(notifications)
  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/notifications', async (req, res) => {
  try {
    const notification = await database.createNotification(req.body)
    res.json(notification)
  } catch (error) {
    console.error('Create notification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await database.markNotificationAsRead(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Resume upload routes
app.get('/api/resume-uploads/user/:userId', async (req, res) => {
  try {
    const uploads = await database.getResumeUploadsByUserId(req.params.userId)
    res.json(uploads)
  } catch (error) {
    console.error('Get resume uploads error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.post('/api/resume-uploads', async (req, res) => {
  try {
    const upload = await database.createResumeUpload(req.body)
    res.json(upload)
  } catch (error) {
    console.error('Create resume upload error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down API server...')
  await database.close()
  process.exit(0)
})

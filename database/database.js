import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class Database {
  constructor() {
    this.db = null
    this.isConnected = false
  }

  async connect() {
    if (this.isConnected) return

    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'frhire.db')
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err)
          reject(err)
        } else {
          console.log('Connected to SQLite database')
          this.isConnected = true
          this.initializeTables().then(resolve).catch(reject)
        }
      })
    })
  }

  async initializeTables() {
    const fs = await import('fs')
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')

    return new Promise((resolve, reject) => {
      this.db.exec(schema, (err) => {
        if (err) {
          console.error('Error initializing tables:', err)
          reject(err)
        } else {
          console.log('Database tables initialized')
          this.seedData().then(resolve).catch(reject)
        }
      })
    })
  }

  async seedData() {
    // Check if data already exists
    const userCount = await this.getUserCount()
    if (userCount > 0) {
      console.log('Database already seeded')
      return
    }

    // Insert sample users
    const users = [
      {
        email: 'john@student.com',
        name: 'John Smith',
        user_type: 'student',
        coins: 100
      },
      {
        email: 'jane@student.com',
        name: 'Jane Doe',
        user_type: 'student',
        coins: 100
      },
      {
        email: 'mike@student.com',
        name: 'Mike Johnson',
        user_type: 'student',
        coins: 100
      },
      {
        email: 'recruiter@example.com',
        name: 'Sarah Wilson',
        user_type: 'recruiter',
        coins: 0
      }
    ]

    for (const user of users) {
      await this.createUser(user)
    }

    // Insert sample applications
    const applications = [
      {
        job_id: 1,
        job_title: 'Frontend Developer',
        company: 'Tech Corp',
        user_id: 1,
        name: 'John Smith',
        email: 'john@student.com',
        phone: '+1-555-0123',
        status: 'Applied',
        applied_date: '2024-01-16',
        experience: '3 years',
        skills: JSON.stringify(['React', 'JavaScript', 'CSS', 'HTML']),
        experience_summary: 'Experienced frontend developer with strong React skills and modern web development practices.',
        notes: 'Application submitted successfully',
        resume: 'john_smith_resume.pdf'
      },
      {
        job_id: 1,
        job_title: 'Frontend Developer',
        company: 'Tech Corp',
        user_id: 2,
        name: 'Jane Doe',
        email: 'jane@student.com',
        phone: '+1-555-0124',
        status: 'Interview Scheduled',
        applied_date: '2024-01-15',
        experience: '2 years',
        skills: JSON.stringify(['Vue.js', 'TypeScript', 'SASS', 'Node.js']),
        experience_summary: 'Passionate developer with experience in Vue.js and modern JavaScript frameworks.',
        notes: 'Strong technical background',
        resume: 'jane_doe_resume.pdf',
        rating: 4,
        feedback: 'Excellent technical skills and good communication.',
        reviewed_by: 'Sarah Johnson',
        reviewed_date: '2024-01-17'
      },
      {
        job_id: 2,
        job_title: 'Backend Developer',
        company: 'Tech Corp',
        user_id: 3,
        name: 'Mike Johnson',
        email: 'mike@student.com',
        phone: '+1-555-0125',
        status: 'Under Review',
        applied_date: '2024-01-14',
        experience: '4 years',
        skills: JSON.stringify(['Node.js', 'Python', 'PostgreSQL', 'AWS']),
        experience_summary: 'Backend specialist with extensive experience in scalable systems.',
        notes: 'Impressive portfolio',
        resume: 'mike_johnson_resume.pdf'
      }
    ]

    for (const application of applications) {
      await this.createApplication(application)
    }

    console.log('Sample data seeded successfully')
  }

  // User operations
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { email, name, password_hash, user_type, coins = 100 } = userData
      const sql = `INSERT INTO users (email, name, password_hash, user_type, coins) 
                   VALUES (?, ?, ?, ?, ?)`

      this.db.run(sql, [email, name, password_hash, user_type, coins], function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, ...userData })
        }
      })
    })
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?'
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  async getUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?'
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  async updateUser(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      const sql = `UPDATE users SET ${fields} WHERE id = ?`

      this.db.run(sql, [...values, id], function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ changes: this.changes })
        }
      })
    })
  }

  async getUserCount() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM users'
      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row.count)
        }
      })
    })
  }

  // Application operations
  async createApplication(applicationData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(applicationData).join(', ')
      const placeholders = Object.keys(applicationData).map(() => '?').join(', ')
      const values = Object.values(applicationData)

      const sql = `INSERT INTO applications (${fields}) VALUES (${placeholders})`

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, ...applicationData })
        }
      })
    })
  }

  async getApplicationsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC'
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          // Parse JSON fields
          const applications = rows.map(row => ({
            ...row,
            skills: row.skills ? JSON.parse(row.skills) : []
          }))
          resolve(applications)
        }
      })
    })
  }

  async getAllApplications() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM applications ORDER BY created_at DESC'
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          // Parse JSON fields
          const applications = rows.map(row => ({
            ...row,
            skills: row.skills ? JSON.parse(row.skills) : []
          }))
          resolve(applications)
        }
      })
    })
  }

  async updateApplication(id, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ')
      const values = Object.values(updates)
      const sql = `UPDATE applications SET ${fields} WHERE id = ?`

      this.db.run(sql, [...values, id], function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ changes: this.changes })
        }
      })
    })
  }

  async getApplicationById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM applications WHERE id = ?'
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err)
        } else {
          if (row) {
            row.skills = row.skills ? JSON.parse(row.skills) : []
          }
          resolve(row)
        }
      })
    })
  }

  // Notification operations
  async createNotification(notificationData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(notificationData).join(', ')
      const placeholders = Object.keys(notificationData).map(() => '?').join(', ')
      const values = Object.values(notificationData)

      const sql = `INSERT INTO notifications (${fields}) VALUES (${placeholders})`

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, ...notificationData })
        }
      })
    })
  }

  async getNotificationsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }

  async markNotificationAsRead(notificationId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE notifications SET is_read = 1 WHERE id = ?'
      this.db.run(sql, [notificationId], function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ changes: this.changes })
        }
      })
    })
  }

  // Resume upload operations
  async createResumeUpload(uploadData) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(uploadData).join(', ')
      const placeholders = Object.keys(uploadData).map(() => '?').join(', ')
      const values = Object.values(uploadData)

      const sql = `INSERT INTO resume_uploads (${fields}) VALUES (${placeholders})`

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, ...uploadData })
        }
      })
    })
  }

  async getResumeUploadsByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM resume_uploads WHERE user_id = ? ORDER BY uploaded_at DESC'
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err)
        } else {
          // Parse JSON fields
          const uploads = rows.map(row => ({
            ...row,
            ats_analysis: row.ats_analysis ? JSON.parse(row.ats_analysis) : null
          }))
          resolve(uploads)
        }
      })
    })
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err)
          } else {
            console.log('Database connection closed')
          }
          this.isConnected = false
          resolve()
        })
      })
    }
  }
}

// Create singleton instance
const database = new Database()

export default database

// Simple JSON-based database for resume data
// Using localStorage for client-side storage

const DB_NAME = 'frhire_resumes'
const DB_VERSION = '1.0'

// Initialize database
export const initDatabase = () => {
  try {
    const existingData = localStorage.getItem(DB_NAME)
    if (!existingData) {
      const initialData = {
        version: DB_VERSION,
        resumes: [],
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(DB_NAME, JSON.stringify(initialData))
    }
    return true
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return false
  }
}

// Save resume data
export const saveResume = (resumeData, userId) => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')

    // Ensure resumes array exists
    if (!dbData.resumes) {
      dbData.resumes = []
    }

    // Create resume entry
    const resumeEntry = {
      id: generateId(),
      userId: userId,
      data: resumeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft' // draft, completed, submitted
    }

    // Check if resume already exists for this user
    const existingIndex = dbData.resumes.findIndex(r => r.userId === userId)

    if (existingIndex >= 0) {
      // Update existing resume
      dbData.resumes[existingIndex] = {
        ...dbData.resumes[existingIndex],
        data: resumeData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new resume
      dbData.resumes.push(resumeEntry)
    }

    // Update last updated timestamp
    dbData.lastUpdated = new Date().toISOString()

    // Save to localStorage
    localStorage.setItem(DB_NAME, JSON.stringify(dbData))

    console.log('Resume saved successfully:', resumeEntry)
    return { success: true, data: resumeEntry }
  } catch (error) {
    console.error('Failed to save resume:', error)
    return { success: false, error: error.message }
  }
}

// Load resume data for user
export const loadResume = (userId) => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')

    if (!dbData.resumes) {
      return { success: true, data: null }
    }

    const userResume = dbData.resumes.find(r => r.userId === userId)
    return { success: true, data: userResume || null }
  } catch (error) {
    console.error('Failed to load resume:', error)
    return { success: false, error: error.message }
  }
}

// Load all resumes (for admin purposes)
export const loadAllResumes = () => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')
    return { success: true, data: dbData.resumes || [] }
  } catch (error) {
    console.error('Failed to load all resumes:', error)
    return { success: false, error: error.message }
  }
}

// Delete resume
export const deleteResume = (userId) => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')

    if (!dbData.resumes) {
      return { success: true, data: null }
    }

    const initialLength = dbData.resumes.length
    dbData.resumes = dbData.resumes.filter(r => r.userId !== userId)

    if (dbData.resumes.length < initialLength) {
      dbData.lastUpdated = new Date().toISOString()
      localStorage.setItem(DB_NAME, JSON.stringify(dbData))
      return { success: true, data: 'Resume deleted successfully' }
    }

    return { success: true, data: 'No resume found to delete' }
  } catch (error) {
    console.error('Failed to delete resume:', error)
    return { success: false, error: error.message }
  }
}

// Update resume status
export const updateResumeStatus = (userId, status) => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')

    if (!dbData.resumes) {
      return { success: false, error: 'No resumes found' }
    }

    const resumeIndex = dbData.resumes.findIndex(r => r.userId === userId)

    if (resumeIndex >= 0) {
      dbData.resumes[resumeIndex].status = status
      dbData.resumes[resumeIndex].updatedAt = new Date().toISOString()
      dbData.lastUpdated = new Date().toISOString()

      localStorage.setItem(DB_NAME, JSON.stringify(dbData))
      return { success: true, data: dbData.resumes[resumeIndex] }
    }

    return { success: false, error: 'Resume not found' }
  } catch (error) {
    console.error('Failed to update resume status:', error)
    return { success: false, error: error.message }
  }
}

// Get database statistics
export const getDatabaseStats = () => {
  try {
    const dbData = JSON.parse(localStorage.getItem(DB_NAME) || '{}')

    const stats = {
      totalResumes: dbData.resumes?.length || 0,
      lastUpdated: dbData.lastUpdated || null,
      version: dbData.version || 'unknown'
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    return { success: false, error: error.message }
  }
}

// Export database (for backup)
export const exportDatabase = () => {
  try {
    const dbData = localStorage.getItem(DB_NAME)
    if (!dbData) {
      return { success: false, error: 'No database found' }
    }

    const blob = new Blob([dbData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `frhire_database_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, data: 'Database exported successfully' }
  } catch (error) {
    console.error('Failed to export database:', error)
    return { success: false, error: error.message }
  }
}

// Import database (for restore)
export const importDatabase = (file) => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result)

          // Validate the imported data structure
          if (importedData.version && importedData.resumes) {
            localStorage.setItem(DB_NAME, e.target.result)
            resolve({ success: true, data: 'Database imported successfully' })
          } else {
            resolve({ success: false, error: 'Invalid database format' })
          }
        } catch {
          resolve({ success: false, error: 'Invalid JSON format' })
        }
      }
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' })
      }
      reader.readAsText(file)
    } catch (error) {
      resolve({ success: false, error: error.message })
    }
  })
}

// Generate unique ID
const generateId = () => {
  return 'resume_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Clear all data (for testing)
export const clearDatabase = () => {
  try {
    localStorage.removeItem(DB_NAME)
    return { success: true, data: 'Database cleared successfully' }
  } catch (error) {
    console.error('Failed to clear database:', error)
    return { success: false, error: error.message }
  }
}

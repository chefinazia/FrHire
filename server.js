import database from './database/database.js'

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...')
    await database.connect()
    console.log('Database initialized successfully!')

    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('\nShutting down...')
      await database.close()
      process.exit(0)
    })

    // Keep alive
    setInterval(() => { }, 1000)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

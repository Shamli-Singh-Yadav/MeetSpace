// src/server.js
// Main Express server with Socket.io
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { config } from 'dotenv'
import { initializeSocket } from './utils/socket-io.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import meetingRoutes from './routes/meetingRoutes.js'
import notesRoutes from './routes/notesRoutes.js'
import commentsRoutes from './routes/commentsRoutes.js'
import recordingsRoutes from './routes/recordingsRoutes.js'

// Load environment variables
config()

const app = express()
const server = createServer(app)

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:7000',
    credentials: true,
  })
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Initialize Socket.io
const io = initializeSocket(server)

// Root route
app.get('/', (req, res) => {
  res.json({ status: 'Backend running', api: 'available', port: process.env.PORT || 7000 })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// API Routes
app.use('/meetings', meetingRoutes)
app.use('/notes', notesRoutes)
app.use('/comments', commentsRoutes)
app.use('/recordings', recordingsRoutes)

// 404 handler
app.use(notFound)

// Error handler
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 7000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.io server ready`)
})

export default server

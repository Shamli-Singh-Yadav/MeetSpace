// src/routes/meetingRoutes.js
// Routes for meeting operations
import express from 'express'
import { verifyAuth } from '../middleware/auth.js'
import {
  createMeeting,
  getAllMeetings,
  getMeetingById,
  joinMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingByRoomCode,
} from '../controllers/meetingController.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(verifyAuth)

// Create meeting
router.post('/', createMeeting)

// Get all meetings
router.get('/', getAllMeetings)

// Get meeting by ID
router.get('/:meetingId', getMeetingById)

// Join meeting
router.post('/:meetingId/join', joinMeeting)

// Update meeting
router.put('/:meetingId', updateMeeting)

// Delete meeting
router.delete('/:meetingId', deleteMeeting)

// Get meeting by room code
router.post('/code/search', getMeetingByRoomCode)

export default router

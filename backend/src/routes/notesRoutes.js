// src/routes/notesRoutes.js
// Routes for notes operations
import express from 'express'
import { verifyAuth } from '../middleware/auth.js'
import {
  createNote,
  getNotesByMeeting,
  updateNote,
  deleteNote,
} from '../controllers/notesController.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(verifyAuth)

// Create note
router.post('/', createNote)

// Get notes by meeting
router.get('/meeting/:meetingId', getNotesByMeeting)

// Update note
router.put('/:noteId', updateNote)

// Delete note
router.delete('/:noteId', deleteNote)

export default router

// src/routes/commentsRoutes.js
// Routes for comments operations
import express from 'express'
import { verifyAuth } from '../middleware/auth.js'
import {
  createComment,
  getCommentsByMeeting,
  getCommentsByNote,
  updateComment,
  deleteComment,
} from '../controllers/commentsController.js'

const router = express.Router()

// Apply auth middleware to all routes
router.use(verifyAuth)

// Create comment
router.post('/', createComment)

// Get comments by meeting
router.get('/meeting/:meetingId', getCommentsByMeeting)

// Get comments by note
router.get('/note/:noteId', getCommentsByNote)

// Update comment
router.put('/:commentId', updateComment)

// Delete comment
router.delete('/:commentId', deleteComment)

export default router

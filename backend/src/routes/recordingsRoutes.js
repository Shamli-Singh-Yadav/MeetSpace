// src/routes/recordingsRoutes.js
// Routes for recordings operations
import express from 'express'
import multer from 'multer'
import { verifyAuth } from '../middleware/auth.js'
import {
  createRecording,
  getAllRecordings,
  getRecordingsByMeeting,
  uploadRecording,
  deleteRecording,
} from '../controllers/recordingsController.js'

const router = express.Router()
const upload = multer({
  limits: {
    fileSize: 104857600, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video/audio files are allowed'))
    }
  },
})

// Apply auth middleware to all routes
router.use(verifyAuth)

// Create recording record
router.post('/', createRecording)

// Get all recordings
router.get('/', getAllRecordings)

// Get recordings by meeting
router.get('/meeting/:meetingId', getRecordingsByMeeting)

// Upload recording file
router.post('/upload', upload.single('recording'), uploadRecording)

// Delete recording
router.delete('/:recordingId', deleteRecording)

export default router

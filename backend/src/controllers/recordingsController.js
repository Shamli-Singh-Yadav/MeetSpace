// src/controllers/recordingsController.js
// Controllers for recordings operations
import { db, storage } from '../utils/firebase-admin.js'
import { v4 as uuidv4 } from 'uuid'
import { NotFoundError, ValidationError } from '../utils/errors.js'

// Create recording record
export const createRecording = async (req, res, next) => {
  try {
    const { meetingId, title, duration } = req.body
    const userId = req.user.uid

    if (!meetingId) {
      throw new ValidationError('Meeting ID is required')
    }

    const recordingId = uuidv4()
    const recordingData = {
      id: recordingId,
      meetingId,
      title: title || 'Recording',
      duration,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'processing',
    }

    await db.collection('recordings').doc(recordingId).set(recordingData)

    res.status(201).json(recordingData)
  } catch (error) {
    next(error)
  }
}

// Get all recordings for user
export const getAllRecordings = async (req, res, next) => {
  try {
    const userId = req.user.uid

    const snapshot = await db
      .collection('recordings')
      .where('createdBy', '==', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const recordings = snapshot.docs.map((doc) => doc.data())

    res.json(recordings)
  } catch (error) {
    next(error)
  }
}

// Get recordings by meeting
export const getRecordingsByMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params

    const snapshot = await db
      .collection('recordings')
      .where('meetingId', '==', meetingId)
      .orderBy('createdAt', 'desc')
      .get()

    const recordings = snapshot.docs.map((doc) => doc.data())

    res.json(recordings)
  } catch (error) {
    next(error)
  }
}

// Upload recording file
export const uploadRecording = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('No file provided')
    }

    const { meetingId, title } = req.body
    const userId = req.user.uid

    if (!meetingId) {
      throw new ValidationError('Meeting ID is required')
    }

    const recordingId = uuidv4()
    const bucket = storage.bucket()
    const fileName = `recordings/${userId}/${recordingId}.webm`
    const file = bucket.file(fileName)

    // Upload file
    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          meetingId,
          userId,
        },
      },
    })

    // Get download URL
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1 year
    })

    // Save recording metadata
    const recordingData = {
      id: recordingId,
      meetingId,
      title: title || 'Recording',
      url,
      fileName,
      size: req.file.size,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      status: 'completed',
    }

    await db.collection('recordings').doc(recordingId).set(recordingData)

    res.status(201).json(recordingData)
  } catch (error) {
    next(error)
  }
}

// Delete recording
export const deleteRecording = async (req, res, next) => {
  try {
    const { recordingId } = req.params
    const userId = req.user.uid

    const recordingRef = db.collection('recordings').doc(recordingId)
    const recordingDoc = await recordingRef.get()

    if (!recordingDoc.exists) {
      throw new NotFoundError('Recording not found')
    }

    const recordingData = recordingDoc.data()

    if (recordingData.createdBy !== userId) {
      throw new Error('Only recording creator can delete')
    }

    // Delete file from storage
    if (recordingData.fileName) {
      const bucket = storage.bucket()
      await bucket.file(recordingData.fileName).delete()
    }

    // Delete metadata
    await recordingRef.delete()

    res.json({ message: 'Recording deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// src/controllers/meetingController.js
// Controllers for meeting operations
import { db } from '../utils/firebase-admin.js'
import { v4 as uuidv4 } from 'uuid'
import { ValidationError, NotFoundError } from '../utils/errors.js'

// Create a new meeting
export const createMeeting = async (req, res, next) => {
  try {
    const { title, roomCode } = req.body
    const userId = req.user.uid

    if (!roomCode) {
      throw new ValidationError('Room code is required')
    }

    const meetingId = uuidv4()
    const meetingData = {
      id: meetingId,
      title: title || 'Untitled Meeting',
      roomCode,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      participants: [userId],
      participantCount: 1,
      status: 'active',
    }

    // Save to Firestore
    await db.collection('meetings').doc(meetingId).set(meetingData)

    res.status(201).json(meetingData)
  } catch (error) {
    next(error)
  }
}

// Get all meetings for a user
export const getAllMeetings = async (req, res, next) => {
  try {
    const userId = req.user.uid

    const snapshot = await db
      .collection('meetings')
      .where('participants', 'array-contains', userId)
      .orderBy('createdAt', 'desc')
      .get()

    const meetings = snapshot.docs.map((doc) => doc.data())

    res.json(meetings)
  } catch (error) {
    next(error)
  }
}

// Get meeting by ID
export const getMeetingById = async (req, res, next) => {
  try {
    const { meetingId } = req.params

    const doc = await db.collection('meetings').doc(meetingId).get()

    if (!doc.exists) {
      throw new NotFoundError('Meeting not found')
    }

    res.json(doc.data())
  } catch (error) {
    next(error)
  }
}

// Join a meeting
export const joinMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params
    const userId = req.user.uid

    const meetingRef = db.collection('meetings').doc(meetingId)
    const meetingDoc = await meetingRef.get()

    if (!meetingDoc.exists) {
      throw new NotFoundError('Meeting not found')
    }

    const meetingData = meetingDoc.data()

    // Add user to participants if not already present
    if (!meetingData.participants.includes(userId)) {
      await meetingRef.update({
        participants: [...meetingData.participants, userId],
        participantCount: meetingData.participants.length + 1,
      })
    }

    const updatedDoc = await meetingRef.get()
    res.json(updatedDoc.data())
  } catch (error) {
    next(error)
  }
}

// Update meeting
export const updateMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params
    const { title } = req.body
    const userId = req.user.uid

    const meetingRef = db.collection('meetings').doc(meetingId)
    const meetingDoc = await meetingRef.get()

    if (!meetingDoc.exists) {
      throw new NotFoundError('Meeting not found')
    }

    if (meetingDoc.data().createdBy !== userId) {
      throw new Error('Only meeting creator can update')
    }

    await meetingRef.update({
      title,
      updatedAt: new Date().toISOString(),
    })

    const updatedDoc = await meetingRef.get()
    res.json(updatedDoc.data())
  } catch (error) {
    next(error)
  }
}

// Delete meeting
export const deleteMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params
    const userId = req.user.uid

    const meetingRef = db.collection('meetings').doc(meetingId)
    const meetingDoc = await meetingRef.get()

    if (!meetingDoc.exists) {
      throw new NotFoundError('Meeting not found')
    }

    if (meetingDoc.data().createdBy !== userId) {
      throw new Error('Only meeting creator can delete')
    }

    await meetingRef.delete()

    res.json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    next(error)
  }
}

// Get meeting by room code
export const getMeetingByRoomCode = async (req, res, next) => {
  try {
    const { roomCode } = req.body

    const snapshot = await db
      .collection('meetings')
      .where('roomCode', '==', roomCode)
      .limit(1)
      .get()

    if (snapshot.empty) {
      throw new NotFoundError('Meeting not found')
    }

    const meeting = snapshot.docs[0].data()
    res.json(meeting)
  } catch (error) {
    next(error)
  }
}

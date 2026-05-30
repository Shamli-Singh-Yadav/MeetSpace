// src/controllers/notesController.js
// Controllers for notes operations
import { db } from '../utils/firebase-admin.js'
import { v4 as uuidv4 } from 'uuid'
import { ValidationError, NotFoundError } from '../utils/errors.js'

// Create a note
export const createNote = async (req, res, next) => {
  try {
    const { meetingId, content, title } = req.body
    const userId = req.user.uid

    if (!meetingId || !content) {
      throw new ValidationError('Meeting ID and content are required')
    }

    const noteId = uuidv4()
    const noteData = {
      id: noteId,
      meetingId,
      content,
      title: title || '',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.collection('notes').doc(noteId).set(noteData)

    res.status(201).json(noteData)
  } catch (error) {
    next(error)
  }
}

// Get notes by meeting
export const getNotesByMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params

    const snapshot = await db
      .collection('notes')
      .where('meetingId', '==', meetingId)
      .orderBy('createdAt', 'desc')
      .get()

    const notes = snapshot.docs.map((doc) => doc.data())

    res.json(notes)
  } catch (error) {
    next(error)
  }
}

// Update note
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params
    const { content, title } = req.body
    const userId = req.user.uid

    const noteRef = db.collection('notes').doc(noteId)
    const noteDoc = await noteRef.get()

    if (!noteDoc.exists) {
      throw new NotFoundError('Note not found')
    }

    const noteData = noteDoc.data()
    if (noteData.createdBy !== userId) {
      throw new Error('Only note creator can update')
    }

    const updatedData = {
      ...noteData,
      content: content || noteData.content,
      title: title !== undefined ? title : noteData.title,
      updatedAt: new Date().toISOString(),
    }

    await noteRef.update(updatedData)

    res.json(updatedData)
  } catch (error) {
    next(error)
  }
}

// Delete note
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params
    const userId = req.user.uid

    const noteRef = db.collection('notes').doc(noteId)
    const noteDoc = await noteRef.get()

    if (!noteDoc.exists) {
      throw new NotFoundError('Note not found')
    }

    if (noteDoc.data().createdBy !== userId) {
      throw new Error('Only note creator can delete')
    }

    await noteRef.delete()

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    next(error)
  }
}

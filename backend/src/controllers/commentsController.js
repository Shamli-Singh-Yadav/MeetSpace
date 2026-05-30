// src/controllers/commentsController.js
// Controllers for comments operations
import { db } from '../utils/firebase-admin.js'
import { v4 as uuidv4 } from 'uuid'
import { ValidationError, NotFoundError } from '../utils/errors.js'

// Create a comment
export const createComment = async (req, res, next) => {
  try {
    const { noteId, content } = req.body
    const userId = req.user.uid
    const user = req.user

    if (!noteId || !content) {
      throw new ValidationError('Note ID and content are required')
    }

    const commentId = uuidv4()
    const commentData = {
      id: commentId,
      noteId,
      content,
      author: user.name || user.email || 'Anonymous',
      createdBy: userId,
      createdAt: new Date().toISOString(),
    }

    await db.collection('comments').doc(commentId).set(commentData)

    res.status(201).json(commentData)
  } catch (error) {
    next(error)
  }
}

// Get comments by meeting
export const getCommentsByMeeting = async (req, res, next) => {
  try {
    const { meetingId } = req.params

    const snapshot = await db
      .collection('comments')
      .where('meetingId', '==', meetingId)
      .orderBy('createdAt', 'asc')
      .get()

    const comments = snapshot.docs.map((doc) => doc.data())

    res.json(comments)
  } catch (error) {
    next(error)
  }
}

// Get comments by note
export const getCommentsByNote = async (req, res, next) => {
  try {
    const { noteId } = req.params

    const snapshot = await db
      .collection('comments')
      .where('noteId', '==', noteId)
      .orderBy('createdAt', 'asc')
      .get()

    const comments = snapshot.docs.map((doc) => doc.data())

    res.json(comments)
  } catch (error) {
    next(error)
  }
}

// Update comment
export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const { content } = req.body
    const userId = req.user.uid

    const commentRef = db.collection('comments').doc(commentId)
    const commentDoc = await commentRef.get()

    if (!commentDoc.exists) {
      throw new NotFoundError('Comment not found')
    }

    if (commentDoc.data().createdBy !== userId) {
      throw new Error('Only comment creator can update')
    }

    await commentRef.update({
      content,
      updatedAt: new Date().toISOString(),
    })

    const updatedDoc = await commentRef.get()
    res.json(updatedDoc.data())
  } catch (error) {
    next(error)
  }
}

// Delete comment
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const userId = req.user.uid

    const commentRef = db.collection('comments').doc(commentId)
    const commentDoc = await commentRef.get()

    if (!commentDoc.exists) {
      throw new NotFoundError('Comment not found')
    }

    if (commentDoc.data().createdBy !== userId) {
      throw new Error('Only comment creator can delete')
    }

    await commentRef.delete()

    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    next(error)
  }
}

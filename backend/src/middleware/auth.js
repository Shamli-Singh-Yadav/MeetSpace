// src/middleware/auth.js
// Authentication middleware to verify Firebase tokens

import { auth } from '../utils/firebase-admin.js'
import { AuthenticationError } from '../utils/errors.js'

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const decodedToken = await auth.verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: ' + error.message })
  }
}

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      const decodedToken = await auth.verifyIdToken(token)
      req.user = decodedToken
    }

    next()
  } catch (error) {
    console.error('Auth error:', error)
    next()
  }
}

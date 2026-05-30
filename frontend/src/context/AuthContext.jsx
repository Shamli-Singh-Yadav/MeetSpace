// src/context/AuthContext.jsx
// Authentication context for managing user state globally
import React, { createContext, useEffect, useState } from 'react'
import { auth } from '../utils/firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError(null)
      const { user: authUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update user profile with display name
      await updateProfile(authUser, {
        displayName: displayName,
      })

      return authUser
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Sign in with email and password
  const signin = async (email, password) => {
    try {
      setError(null)
      const { user: authUser } = await signInWithEmailAndPassword(auth, email, password)
      return authUser
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Sign out
  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    loading,
    error,
    signup,
    signin,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

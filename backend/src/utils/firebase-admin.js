// src/utils/firebase-admin.js
// Firebase Admin SDK initialization
import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { join } from 'path'

const serviceAccountPath = join(process.cwd(), 'serviceAccountKey.json')

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error)
    // Fallback to environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  }
}

export const firebaseAdmin = admin
export const db = admin.firestore()
export const storage = admin.storage()
export const auth = admin.auth()

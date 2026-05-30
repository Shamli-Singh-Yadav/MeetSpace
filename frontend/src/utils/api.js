// src/utils/api.js
// API client for communicating with backend
import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const token = await auth.currentUser?.getIdToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (error) {
    console.error('Error getting auth token:', error)
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Meeting APIs
export const meetingAPI = {
  create: (data) => api.post('/meetings', data),
  getAll: () => api.get('/meetings'),
  getById: (id) => api.get(`/meetings/${id}`),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  joinById: (id) => api.post(`/meetings/${id}/join`),
  joinByCode: (roomCode) => api.post('/meetings/code/search', { roomCode }),
}

// Notes APIs
export const notesAPI = {
  create: (data) => api.post('/notes', data),
  getByMeeting: (meetingId) => api.get(`/notes/meeting/${meetingId}`),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
}

// Comments APIs
export const commentsAPI = {
  create: (data) => api.post('/comments', data),
  getByMeeting: (meetingId) => api.get(`/comments/meeting/${meetingId}`),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
}

// Recordings APIs
export const recordingsAPI = {
  list: () => api.get('/recordings'),
  getByMeeting: (meetingId) => api.get(`/recordings/meeting/${meetingId}`),
  delete: (id) => api.delete(`/recordings/${id}`),
}

export default api

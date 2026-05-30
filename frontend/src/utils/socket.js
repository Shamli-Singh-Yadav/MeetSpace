// src/utils/socket.js
// Socket.io configuration for real-time communication
import io from 'socket.io-client'

let socket = null

export const initializeSocket = () => {
  if (socket) return socket

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Emit events
export const emitMessage = (meetingId, message, sender) => {
  if (socket) {
    socket.emit('send-message', { meetingId, message, sender })
  }
}

export const emitJoinMeeting = (meetingId, userId, userName) => {
  if (socket) {
    socket.emit('join-meeting', { meetingId, userId, userName })
  }
}

export const emitLeaveMeeting = (meetingId, userId) => {
  if (socket) {
    socket.emit('leave-meeting', { meetingId, userId })
  }
}

// Listen for events
export const onMessageReceived = (callback) => {
  if (socket) {
    socket.on('receive-message', callback)
  }
}

export const onUserJoined = (callback) => {
  if (socket) {
    socket.on('user-joined', callback)
  }
}

export const onUserLeft = (callback) => {
  if (socket) {
    socket.on('user-left', callback)
  }
}

export const onWebRTCSignal = (callback) => {
  if (socket) {
    socket.on('webrtc-signal', callback)
  }
}

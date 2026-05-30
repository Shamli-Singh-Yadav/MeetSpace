// src/utils/socket-io.js
// Socket.io configuration and handlers
import { Server } from 'socket.io'

const activeMeetings = new Map() // meetingId -> { participants: [...] }
const userSockets = new Map() // userId -> socketId

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`)

    // Join meeting
    socket.on('join-meeting', (data) => {
      const { meetingId, userId, userName } = data
      socket.join(meetingId)
      userSockets.set(userId, socket.id)

      // Track participants
      if (!activeMeetings.has(meetingId)) {
        activeMeetings.set(meetingId, {
          participants: [],
        })
      }

      const meeting = activeMeetings.get(meetingId)
      if (!meeting.participants.find((p) => p.id === userId)) {
        meeting.participants.push({
          id: userId,
          name: userName,
          socketId: socket.id,
        })
      }

      // Notify others
      socket.to(meetingId).emit('user-joined', {
        userId,
        userName,
      })

      // Send current participants to joining user
      socket.emit('participants', meeting.participants)

      console.log(`User ${userName} joined meeting ${meetingId}`)
    })

    // Send message
    socket.on('send-message', (data) => {
      const { meetingId, message, sender } = data

      io.to(meetingId).emit('receive-message', {
        message,
        sender,
        timestamp: new Date().toISOString(),
      })

      console.log(`Message in ${meetingId}: ${sender} - ${message}`)
    })

    // WebRTC signal
    socket.on('webrtc-signal', (data) => {
      const { to, type, offer, answer, candidate, from, fromName } = data

      const targetSocketId = userSockets.get(to)
      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc-signal', {
          type,
          from,
          fromName,
          offer,
          answer,
          candidate,
        })
      }
    })

    // Leave meeting
    socket.on('leave-meeting', (data) => {
      const { meetingId, userId } = data

      socket.leave(meetingId)

      // Remove from active meetings
      const meeting = activeMeetings.get(meetingId)
      if (meeting) {
        meeting.participants = meeting.participants.filter((p) => p.id !== userId)

        if (meeting.participants.length === 0) {
          activeMeetings.delete(meetingId)
        }
      }

      userSockets.delete(userId)

      // Notify others
      socket.to(meetingId).emit('user-left', {
        userId,
      })

      console.log(`User ${userId} left meeting ${meetingId}`)
    })

    // Screen share
    socket.on('start-screen-share', (data) => {
      const { meetingId } = data
      socket.to(meetingId).emit('user-screen-shared', {
        userId: data.userId,
      })
    })

    socket.on('stop-screen-share', (data) => {
      const { meetingId } = data
      socket.to(meetingId).emit('user-screen-stopped', {
        userId: data.userId,
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)

      // Clean up
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId)

          // Remove from all meetings
          for (const [meetingId, meeting] of activeMeetings.entries()) {
            meeting.participants = meeting.participants.filter((p) => p.id !== userId)

            if (meeting.participants.length === 0) {
              activeMeetings.delete(meetingId)
            } else {
              // Notify others in meeting
              io.to(meetingId).emit('user-left', {
                userId,
              })
            }
          }

          break
        }
      }
    })
  })

  return io
}

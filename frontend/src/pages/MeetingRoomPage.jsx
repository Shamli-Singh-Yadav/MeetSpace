// src/pages/MeetingRoomPage.jsx
// Main meeting room page with video, chat, controls, and recording
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMeeting } from '../hooks/useMeeting'
import { VideoGrid } from '../components/VideoGrid'
import { ChatBox } from '../components/ChatBox'
import { MeetingControls } from '../components/MeetingControls'
import { RecordingButton } from '../components/RecordingButton'
import { NoteEditor } from '../components/NoteEditor'
import {
  getUserMedia,
  stopStream,
  toggleAudio,
  toggleVideo,
  createPeerConnection,
  addStreamToPeer,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
} from '../utils/webrtc'
import {
  initializeSocket,
  disconnectSocket,
  emitMessage,
  emitJoinMeeting,
  emitLeaveMeeting,
  onMessageReceived,
  onUserJoined,
  onUserLeft,
  onWebRTCSignal,
  getSocket,
} from '../utils/socket'
import { meetingAPI, notesAPI } from '../utils/api'

export const MeetingRoomPage = () => {
  const { meetingId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    currentMeeting,
    setCurrentMeeting,
    participants,
    addParticipant,
    removeParticipant,
    messages,
    addMessage,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
  } = useMeeting()

  // Local state
  const [localStream, setLocalStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const peerConnectionsRef = useRef({})
  const socket = getSocket()

  // Initialize meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        setLoading(true)

        // Get meeting details
        const response = await meetingAPI.getById(meetingId)
        setCurrentMeeting(response.data)

        // Initialize socket
        initializeSocket()

        // Get user media
        const stream = await getUserMedia()
        setLocalStream(stream)

        // Join meeting
        emitJoinMeeting(meetingId, user.uid, user.displayName)

        // Setup socket listeners
        setupSocketListeners()
      } catch (err) {
        setError('Failed to initialize meeting: ' + err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    initializeMeeting()

    return () => {
      // Cleanup
      if (localStream) {
        stopStream(localStream)
      }
      emitLeaveMeeting(meetingId, user.uid)
      disconnectSocket()
    }
  }, [meetingId, user])

  const setupSocketListeners = () => {
    // Message received
    onMessageReceived((data) => {
      addMessage({
        sender: data.sender,
        message: data.message,
        timestamp: new Date().toISOString(),
      })
    })

    // User joined
    onUserJoined((data) => {
      addParticipant({
        id: data.userId,
        name: data.userName,
        stream: null,
      })
    })

    // User left
    onUserLeft((data) => {
      removeParticipant(data.userId)
    })

    // WebRTC signal
    onWebRTCSignal(async (data) => {
      try {
        if (data.type === 'offer') {
          const peerConnection = createPeerConnection()
          peerConnectionsRef.current[data.from] = peerConnection

          if (localStream) {
            addStreamToPeer(peerConnection, localStream)
          }

          peerConnection.ontrack = (event) => {
            addParticipant({
              id: data.from,
              name: data.fromName,
              stream: event.streams[0],
            })
          }

          const answer = await createAnswer(peerConnection, data.offer)
          socket.emit('webrtc-signal', {
            to: data.from,
            type: 'answer',
            answer: answer,
            from: user.uid,
            fromName: user.displayName,
          })
        } else if (data.type === 'answer') {
          const peerConnection = peerConnectionsRef.current[data.from]
          if (peerConnection) {
            await setRemoteAnswer(peerConnection, data.answer)
          }
        } else if (data.type === 'candidate') {
          const peerConnection = peerConnectionsRef.current[data.from]
          if (peerConnection) {
            await addIceCandidate(peerConnection, data.candidate)
          }
        }
      } catch (err) {
        console.error('WebRTC signal error:', err)
      }
    })
  }

  const handleToggleMic = () => {
    if (localStream) {
      toggleAudio(localStream, isMuted)
      setIsMuted(!isMuted)
    }
  }

  const handleToggleVideo = () => {
    if (localStream) {
      toggleVideo(localStream, isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }

  const handleToggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
        })
        setIsScreenSharing(true)

        // Replace video track
        const screenTrack = screenStream.getVideoTracks()[0]
        const sender = Object.values(peerConnectionsRef.current)[0]?.getSenders?.()[0]
        if (sender) {
          await sender.replaceTrack(screenTrack)
        }

        // Stop screen sharing when user stops
        screenTrack.onended = () => {
          if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0]
            if (videoTrack && sender) {
              sender.replaceTrack(videoTrack)
            }
          }
          setIsScreenSharing(false)
        }
      } else {
        // Stop screen sharing
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0]
          const sender = Object.values(peerConnectionsRef.current)[0]?.getSenders?.()[0]
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack)
          }
        }
        setIsScreenSharing(false)
      }
    } catch (err) {
      console.error('Screen share error:', err)
    }
  }

  const handleStartRecording = () => {
    if (localStream) {
      const mediaRecorder = new MediaRecorder(localStream, {
        mimeType: 'video/webm;codecs=vp9',
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: 'video/webm',
        })

        // Upload recording
        const formData = new FormData()
        formData.append('recording', blob)
        formData.append('meetingId', meetingId)
        formData.append('title', currentMeeting?.title)

        try {
          await fetch('/api/recordings/upload', {
            method: 'POST',
            body: formData,
          })
          recordedChunksRef.current = []
        } catch (err) {
          console.error('Recording upload error:', err)
        }
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      // Track recording time
      let seconds = 0
      recordingIntervalRef.current = setInterval(() => {
        seconds++
        setRecordingTime(seconds)
      }, 1000)
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingTime(0)
    }
  }

  const handleSendMessage = (message) => {
    emitMessage(meetingId, message, user.displayName)
    addMessage({
      sender: 'You',
      message: message,
      timestamp: new Date().toISOString(),
    })
  }

  const handleLeave = () => {
    if (localStream) {
      stopStream(localStream)
    }
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {error && (
        <div className="bg-red-500 text-white p-4 text-center">
          {error}
        </div>
      )}

      {/* Meeting Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{currentMeeting?.title}</h1>
          <p className="text-gray-400">Code: {location.state?.roomCode}</p>
        </div>
        <RecordingButton
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStart={handleStartRecording}
          onStop={handleStopRecording}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 flex flex-col gap-4">
          <VideoGrid
            participants={participants}
            localStream={localStream}
            userName={user.displayName}
          />

          {/* Controls */}
          <MeetingControls
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isScreenSharing={isScreenSharing}
            onToggleMic={handleToggleMic}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onLeave={handleLeave}
          />
        </div>

        {/* Sidebar - Chat and Notes */}
        <div className="w-80 flex flex-col gap-4">
          {/* Chat/Notes Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                showChat
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                showNotes
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Notes
            </button>
          </div>

          {/* Chat or Notes Panel */}
          {showChat && (
            <ChatBox messages={messages} onSendMessage={handleSendMessage} />
          )}

          {showNotes && (
            <NoteEditor
              initialNotes=""
              onSave={(notes) => {
                // Save notes to backend
                notesAPI.create({
                  meetingId: meetingId,
                  content: notes,
                })
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

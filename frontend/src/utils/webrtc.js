// src/utils/webrtc.js
// WebRTC utility functions for peer-to-peer video communication
// This handles video/audio streams and peer connections

const STUN_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
]

const ICE_SERVERS = {
  iceServers: STUN_SERVERS,
}

// Create a peer connection for each participant
export const createPeerConnection = () => {
  return new RTCPeerConnection({
    iceServers: STUN_SERVERS,
  })
}

// Get user's local media (camera and microphone)
export const getUserMedia = async (constraints = { video: true, audio: true }) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    return stream
  } catch (error) {
    console.error('Error accessing media devices:', error)
    throw error
  }
}

// Get screen for screen sharing
export const getScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: false,
    })
    return stream
  } catch (error) {
    console.error('Error accessing screen:', error)
    throw error
  }
}

// Add stream to peer connection
export const addStreamToPeer = (peerConnection, stream) => {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream)
  })
}

// Create offer for establishing connection
export const createOffer = async (peerConnection) => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer))
    return offer
  } catch (error) {
    console.error('Error creating offer:', error)
    throw error
  }
}

// Create answer to peer's offer
export const createAnswer = async (peerConnection, offer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer))
    return answer
  } catch (error) {
    console.error('Error creating answer:', error)
    throw error
  }
}

// Set remote answer
export const setRemoteAnswer = async (peerConnection, answer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
  } catch (error) {
    console.error('Error setting remote answer:', error)
    throw error
  }
}

// Add ICE candidate
export const addIceCandidate = async (peerConnection, candidate) => {
  try {
    if (candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
  } catch (error) {
    console.error('Error adding ICE candidate:', error)
  }
}

// Stop all tracks in stream
export const stopStream = (stream) => {
  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

// Toggle audio/video tracks
export const toggleAudio = (stream, enabled) => {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled
  })
}

export const toggleVideo = (stream, enabled) => {
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled
  })
}

// Record audio/video streams
export const startRecording = (streams) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const audioDestination = audioContext.createMediaStreamDestination()

  // Combine audio from all streams
  streams.forEach((stream) => {
    const source = audioContext.createMediaStreamAudioSource(stream)
    source.connect(audioDestination)
  })

  const mediaRecorder = new MediaRecorder(audioDestination.stream, {
    mimeType: 'audio/webm;codecs=opus',
  })

  return mediaRecorder
}

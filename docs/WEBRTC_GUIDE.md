# WebRTC Implementation Guide - MeetSpace

Detailed explanation of how WebRTC video/audio works in MeetSpace.

## What is WebRTC?

**WebRTC (Web Real-Time Communication)** is a technology that enables:
- Direct peer-to-peer communication
- Video/Audio streaming
- Screen sharing
- Data transmission

All without requiring a plugin or external software!

## How WebRTC Works

### 1. Signaling (Connection Setup)

Before peers can connect, they need to exchange information:

```
Peer A                    Signaling Server              Peer B
  │                             │                         │
  ├─ Create Offer ─────────────→│ ─────────────────────→ │
  │                             │                         │
  │                             │ ← Create Answer ──────┤
  │ ← Answer ──────────────────│                         │
  │                             │                         │
  └─ Exchange ICE Candidates ──→ Relay to Other Peers  
```

### 2. Peer Connection Establishment

```javascript
// Create peer connection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
})

// Add local stream
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream)
})

// Listen for remote stream
peerConnection.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0]
}
```

### 3. Offer/Answer Exchange

**Offerer (calls first):**
```javascript
// Create offer
const offer = await peerConnection.createOffer()

// Set local description
await peerConnection.setLocalDescription(offer)

// Send offer to peer via signaling
socket.emit('webrtc-signal', { type: 'offer', offer })
```

**Answerer (receives call):**
```javascript
// Receive offer
socket.on('webrtc-signal', async (data) => {
  if (data.type === 'offer') {
    // Set remote description
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    )

    // Create answer
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    // Send answer back
    socket.emit('webrtc-signal', { type: 'answer', answer })
  }
})
```

### 4. ICE Candidates (Network Information)

**What are ICE Candidates?**
- Potential network paths to reach the peer
- Include IP addresses and ports
- System automatically selects best path

```javascript
// Listen for ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    // Send candidate to peer
    socket.emit('webrtc-signal', {
      type: 'candidate',
      candidate: event.candidate
    })
  }
}

// Receive and add candidates
socket.on('webrtc-signal', async (data) => {
  if (data.type === 'candidate') {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(data.candidate)
    )
  }
})
```

## Connection Flow in MeetSpace

### Complete Video Meeting Sequence

```
1. User joins meeting room
   ├─ getUserMedia() → Access camera/mic
   └─ Initialize Socket.io

2. Emit 'join-meeting' to backend
   └─ Backend broadcasts 'user-joined' to others

3. For each existing participant:
   ├─ Create RTCPeerConnection
   ├─ Add local stream
   ├─ Create and send offer
   └─ Wait for answer

4. For new participant:
   ├─ Receive offer
   ├─ Create answer
   ├─ Send back answer
   └─ Add tracks from remote stream

5. Exchange ICE candidates
   └─ Candidates sent continuously until connection established

6. Video/audio streams flow peer-to-peer
   └─ No server involvement (except signaling)
```

## Key Concepts

### STUN Servers

**Purpose**: Find your public IP address

```javascript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]
```

**Why needed:**
- Most users behind NAT/firewall
- Can't determine public IP themselves
- STUN server responds with your public IP

### TURN Servers

**Purpose**: Relay data if direct connection fails

```javascript
iceServers: [
  {
    urls: ['turn:turnserver.example.com'],
    username: 'user',
    credential: 'pass'
  }
]
```

**When needed:**
- Symmetric NAT blocking connection
- Firewall preventing peer connection
- High security network environment

### MediaStreams

**Local Stream** (your video/audio):
```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
})

// stream.getTracks() returns array of:
// - AudioTrack
// - VideoTrack
```

**Remote Stream** (peer's video/audio):
```javascript
peerConnection.ontrack = (event) => {
  // event.streams[0] contains remote media
  remoteVideo.srcObject = event.streams[0]
}
```

## Advanced Features

### Screen Sharing

```javascript
// Get screen stream
const screenStream = await navigator.mediaDevices.getDisplayMedia({
  video: { cursor: 'always' },
  audio: false
})

// Replace video track
const sender = peerConnection
  .getSenders()
  .find(s => s.track.kind === 'video')

await sender.replaceTrack(screenStream.getVideoTracks()[0])

// Stop screen sharing
screenStream.getTracks()[0].onended = () => {
  sender.replaceTrack(localStream.getVideoTracks()[0])
}
```

### Audio/Video Controls

```javascript
// Mute audio
stream.getAudioTracks().forEach(track => {
  track.enabled = false
})

// Stop video
stream.getVideoTracks().forEach(track => {
  track.enabled = false
})

// Stop everything
stream.getTracks().forEach(track => {
  track.stop()
})
```

### Recording

```javascript
// Create MediaRecorder from stream
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9'
})

const chunks = []

mediaRecorder.ondataavailable = (e) => {
  if (e.data.size > 0) {
    chunks.push(e.data)
  }
}

mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'video/webm' })
  // Upload blob to server
}

mediaRecorder.start()
// ... later ...
mediaRecorder.stop()
```

## Troubleshooting WebRTC

### Issue: No video/audio

**Check:**
1. Browser permissions granted
2. getUserMedia succeeds
3. console.log(stream.getTracks())
4. Check browser DevTools → Security

**Solution:**
```javascript
try {
  const stream = await getUserMedia()
  console.log('Got stream:', stream)
} catch (error) {
  console.error('Error:', error.name)
  // NotAllowedError: Permission denied
  // NotFoundError: No camera found
}
```

### Issue: Peer connection fails

**Check:**
1. Signaling working (Socket.io connected)
2. Offers/answers being exchanged
3. ICE candidates flowing
4. Check browser console for errors

**Debug:**
```javascript
peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState)
  // connecting → connected → disconnected → failed
}

peerConnection.oniceconnectionstatechange = () => {
  console.log('ICE state:', peerConnection.iceConnectionState)
  // new → checking → connected → completed
}
```

### Issue: Poor video quality

**Solutions:**
1. Start with lower resolution
2. Reduce frame rate
3. Increase bitrate limit
4. Check network speed
5. Use VP9 codec (better compression)

```javascript
const constraints = {
  video: {
    width: { max: 640 },
    height: { max: 480 },
    frameRate: { max: 24 }
  },
  audio: true
}
```

## Performance Optimization

### Bandwidth Reduction

```javascript
// Lower resolution for better bandwidth
const constraints = {
  video: {
    width: { ideal: 320 },
    height: { ideal: 240 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
}
```

### Connection Monitoring

```javascript
// Monitor connection stats
setInterval(async () => {
  const stats = await peerConnection.getStats()
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      console.log('Video bitrate:', report.bytesReceived)
      console.log('Packets lost:', report.packetsLost)
    }
  })
}, 1000)
```

## Browser Compatibility

| Browser | Video | Audio | Screen Share | Notes |
|---------|-------|-------|--------------|-------|
| Chrome  | ✓     | ✓     | ✓            | Best support |
| Firefox | ✓     | ✓     | ✓            | Good support |
| Safari  | ✓     | ✓     | ✗            | Limited support |
| Edge    | ✓     | ✓     | ✓            | Chromium-based |
| IE 11   | ✗     | ✗     | ✗            | Not supported |

## Security Considerations

### Encryption

- All WebRTC traffic is encrypted by default (DTLS)
- Media encrypted with SRTP protocol
- Cannot be intercepted without certificates

### Permissions

- Browser asks for camera/mic permission
- User can revoke anytime
- Server doesn't have access to media stream

### Data Validation

```javascript
// Always validate remote data
if (data && data.type === 'offer' && data.offer) {
  // Safe to process
}
```

## Best Practices

1. **Always handle errors**
   ```javascript
   try {
     await peerConnection.setLocalDescription(offer)
   } catch (error) {
     console.error('Error setting description:', error)
   }
   ```

2. **Clean up resources**
   ```javascript
   peerConnection.close()
   stream.getTracks().forEach(t => t.stop())
   ```

3. **Monitor connection quality**
   ```javascript
   peerConnection.onconnectionstatechange = () => {
     if (peerConnection.connectionState === 'failed') {
       // Attempt reconnection
     }
   }
   ```

4. **Use TURN servers for reliability**
   ```javascript
   // Production setup
   iceServers: [
     { urls: 'stun:...' },
     { urls: 'turn:...', username: '...', credential: '...' }
   ]
   ```

## Resources

- [MDN WebRTC Guide](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebRTC Samples](https://webrtc.github.io/samples/)
- [Interactive Connectivity Establishment](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment)

---

**WebRTC enables peer-to-peer communication without any server involvement for media!**

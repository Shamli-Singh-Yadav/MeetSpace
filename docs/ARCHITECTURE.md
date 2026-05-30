# Architecture Guide - MeetSpace

Complete system architecture and design explanation.

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React App (Vite)                               │   │
│  │  - Components                                   │   │
│  │  - Context (Auth, Meeting)                      │   │
│  │  - Pages & Routes                               │   │
│  └─────────────────────────────────────────────────┘   │
│                  ▲                 ▲                     │
│                  │ REST API        │ WebSocket          │
│                  │ (HTTP)          │ (Socket.io)        │
└──────────────────┼─────────────────┼────────────────────┘
                   │                 │
                   ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│              EXPRESS SERVER (Backend)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes:                                          │  │
│  │ - GET/POST /meetings                             │  │
│  │ - GET/POST /notes                                │  │
│  │ - GET/POST /comments                             │  │
│  │ - GET/POST /recordings                           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Socket.io:                                       │  │
│  │ - join-meeting                                   │  │
│  │ - send-message                                   │  │
│  │ - webrtc-signal                                  │  │
│  │ - leave-meeting                                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
        ▲            ▲              ▲
        │ REST       │ WebSocket    │ Admin SDK
        │            │              │
────────┼────────────┼──────────────┼────────────────────
        │            │              │
        ▼            ▼              ▼
┌────────────────────────────────────────────────────────┐
│            FIREBASE (Backend Services)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Authentication (Firebase Auth)                   │ │
│  │ - Email/Password                                 │ │
│  │ - Google OAuth                                   │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Database (Firestore)                             │ │
│  │ - Meetings Collection                            │ │
│  │ - Notes Collection                               │ │
│  │ - Comments Collection                            │ │
│  │ - Recordings Collection                          │ │
│  └──────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Storage (Firebase Storage)                       │ │
│  │ - Video Recordings                               │ │
│  │ - User Files                                     │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Layers

**1. Pages Layer**
- LandingPage: Public landing
- LoginPage: User authentication
- RegisterPage: User registration
- DashboardPage: Meeting list & creation
- MeetingRoomPage: Active meeting
- RecordingsPage: Recording playback
- NotesPage: Note management

**2. Components Layer**
- ProtectedRoute: Route guard
- Navbar: Navigation bar
- VideoElement: Single video stream
- VideoGrid: Multiple video streams
- ChatBox: Real-time messaging
- MeetingControls: Mic/Camera/Screen
- RecordingButton: Recording controls
- NoteEditor: Note taking UI

**3. Context Layer**
- AuthContext: User authentication state
- MeetingContext: Meeting & participant state

**4. Hooks Layer**
- useAuth: Access auth context
- useMeeting: Access meeting context

**5. Utils Layer**
- firebase.js: Firebase initialization
- socket.js: Socket.io client
- webrtc.js: WebRTC utilities
- api.js: API client
- roomCode.js: Room code generation

### Backend Layers

**1. Server Layer**
- Express app setup
- Socket.io initialization
- Middleware configuration
- Route mounting

**2. Routes Layer**
- Meeting routes
- Notes routes
- Comments routes
- Recordings routes

**3. Controllers Layer**
- Business logic for each feature
- Database operations
- File uploads/downloads

**4. Middleware Layer**
- Authentication (verifyAuth)
- Error handling
- CORS & security

**5. Utils Layer**
- Firebase Admin SDK
- Socket.io event handlers
- Error classes
- Helper functions

## Data Flow

### Meeting Creation Flow

```
User clicks "Create Meeting"
        ↓
[DashboardPage] Collects title
        ↓
Call meetingAPI.create()
        ↓
[POST /meetings] Backend
        ↓
[meetingController] Creates meeting
        ↓
Generate unique ID & room code
        ↓
Save to Firestore
        ↓
Return meeting object
        ↓
Navigate to /meeting/:id
```

### Video Meeting Flow

```
User joins meeting room
        ↓
[MeetingRoomPage] Initializes
        ↓
getUserMedia() → Get camera/mic
        ↓
Initialize Socket.io connection
        ↓
Emit 'join-meeting' event
        ↓
Backend broadcasts 'user-joined'
        ↓
Exchange WebRTC offers/answers
        ↓
Establish peer connections
        ↓
Video/audio streams flow P2P
        ↓
Real-time chat via Socket.io
```

### Recording Flow

```
User clicks "Start Recording"
        ↓
MediaRecorder starts capturing
        ↓
Collect media chunks
        ↓
User clicks "Stop Recording"
        ↓
Blob created from chunks
        ↓
Upload to /recordings/upload
        ↓
Backend saves to Firebase Storage
        ↓
Save metadata to Firestore
        ↓
Signed URL returned
```

### Chat Message Flow

```
User types message
        ↓
Emit 'send-message' via Socket.io
        ↓
Backend broadcasts to room
        ↓
All participants receive message
        ↓
Add to messages list in context
        ↓
Component rerenders with new message
```

## Database Schema

### Meetings Collection

```javascript
{
  id: "uuid",
  title: "Project Discussion",
  roomCode: "ABC-123",
  createdBy: "user_uid",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z",
  participants: ["uid1", "uid2", "uid3"],
  participantCount: 3,
  status: "active" // active, ended, archived
}
```

### Notes Collection

```javascript
{
  id: "uuid",
  meetingId: "meeting_uuid",
  content: "Meeting notes content...",
  title: "Meeting Notes",
  createdBy: "user_uid",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z"
}
```

### Comments Collection

```javascript
{
  id: "uuid",
  noteId: "note_uuid",
  content: "Helpful comment",
  author: "User Name",
  createdBy: "user_uid",
  createdAt: "2024-01-15T10:00:00Z"
}
```

### Recordings Collection

```javascript
{
  id: "uuid",
  meetingId: "meeting_uuid",
  title: "Meeting Recording",
  url: "https://firebase-url...",
  fileName: "recordings/user_uid/uuid.webm",
  size: 52428800,
  duration: 3600,
  createdBy: "user_uid",
  createdAt: "2024-01-15T10:00:00Z",
  status: "completed" // processing, completed, failed
}
```

## WebRTC Connection

### Peer Connection Establishment

```
Peer A                          Peer B
   │                              │
   ├─── createOffer() ──────────→ │
   │                              │
   │ ← setRemoteDescription(offer)│
   │                              │
   │                    createAnswer()
   │                              │
   │ ← setRemoteDescription(answer)
   │                              │
   ├─── ICE Candidates ──────────→ │
   │                              │
   └──→ Video/Audio Streams ──────→ │
        (Peer-to-Peer)
```

### NAT Traversal

- **STUN Servers**: Get public IP address
- **ICE Candidates**: Potential connection paths
- **Connection Selection**: System picks best route

## Security Architecture

### Authentication Flow

```
User → Firebase Auth → ID Token → API Request
                                      ↓
                              Verify Token
                                      ↓
                              Check Permissions
                                      ↓
                              Return Data
```

### Authorization

```
User → Request /notes/:id
         ↓
Check if request.auth.uid == resource.createdBy
         ↓
Grant access ✓ or Deny ✗
```

### Data Isolation

- Each user only sees their own data
- Firestore rules enforce this
- Backend middleware validates ownership

## Scalability Considerations

### Horizontal Scaling

**Frontend:**
- Vercel CDN handles distribution
- No backend needed for static files

**Backend:**
- Can run multiple instances
- Use load balancer
- Use Firebase as shared database

**WebRTC:**
- Peer-to-peer is scalable
- No server resources needed for media

### Vertical Scaling

**Database:**
- Firestore auto-scales
- Pay per operation
- Add indexes for large datasets

**Storage:**
- Firebase Storage auto-scales
- Compress recordings for efficiency

## Error Handling

### Frontend Errors

```javascript
Try {
  API Call
} Catch (error) {
  setError(error.message)
  Log to console
  Show user-friendly message
}
```

### Backend Errors

```javascript
Try {
  Business Logic
} Catch (error) {
  Log error
  Map to AppError
  Return HTTP status + message
}
```

## Performance Optimizations

### Frontend

- **Code Splitting**: Load pages on demand
- **Lazy Loading**: Load components when needed
- **Caching**: Browser cache + Vercel cache
- **Compression**: Gzip + Brotli compression
- **Tree Shaking**: Remove unused code

### Backend

- **Connection Pooling**: Reuse Firebase connections
- **Query Optimization**: Use indexes
- **Response Caching**: Cache frequent queries
- **Pagination**: Limit large result sets

### Video

- **Adaptive Bitrate**: Adjust quality based on bandwidth
- **Codec Selection**: Use efficient codecs
- **Resolution Scaling**: Start low, upgrade if possible

## Development Workflow

```
Feature Development
    ↓
Local Testing
    ↓
Commit to Git
    ↓
Deploy to Staging (if available)
    ↓
Test in Production-like Environment
    ↓
Deploy to Production
    ↓
Monitor for Issues
```

## Monitoring & Observability

### What to Monitor

**Frontend:**
- Page load times
- Error rates
- API response times
- WebRTC connection success rate

**Backend:**
- Response times
- Error rates
- Database queries
- Socket.io connections
- File upload sizes

**Firebase:**
- Database reads/writes
- Storage usage
- Authentication success rate

---

**System is designed for simplicity and scalability!**

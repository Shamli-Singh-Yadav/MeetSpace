# API Reference - MeetSpace

Complete REST API documentation.

## Base URL

```
Development: http://localhost:5000
Production: https://yourbackend.com
```

## Authentication

All endpoints (except public ones) require Firebase ID token:

```
Headers:
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

## Meetings API

### Create Meeting

**Endpoint:** `POST /meetings`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Project Discussion",
  "roomCode": "ABC-123"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Project Discussion",
  "roomCode": "ABC-123",
  "createdBy": "user_uid",
  "createdAt": "2024-01-15T10:00:00Z",
  "participants": ["user_uid"],
  "participantCount": 1,
  "status": "active"
}
```

---

### Get All Meetings

**Endpoint:** `GET /meetings`

**Authentication:** Required

**Query Parameters:** None

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Project Discussion",
    "roomCode": "ABC-123",
    "createdBy": "user_uid",
    "createdAt": "2024-01-15T10:00:00Z",
    "participantCount": 3,
    "status": "active"
  }
]
```

---

### Get Meeting by ID

**Endpoint:** `GET /meetings/:meetingId`

**Authentication:** Required

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Project Discussion",
  "roomCode": "ABC-123",
  "createdBy": "user_uid",
  "createdAt": "2024-01-15T10:00:00Z",
  "participants": ["uid1", "uid2"],
  "participantCount": 2,
  "status": "active"
}
```

---

### Join Meeting

**Endpoint:** `POST /meetings/:meetingId/join`

**Authentication:** Required

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Request Body:** None

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Project Discussion",
  "roomCode": "ABC-123",
  "createdBy": "user_uid",
  "participants": ["uid1", "uid2", "current_uid"],
  "participantCount": 3,
  "status": "active"
}
```

---

### Update Meeting

**Endpoint:** `PUT /meetings/:meetingId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Request Body:**
```json
{
  "title": "Updated Title"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "roomCode": "ABC-123",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Meeting

**Endpoint:** `DELETE /meetings/:meetingId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Response (200):**
```json
{
  "message": "Meeting deleted successfully"
}
```

---

## Notes API

### Create Note

**Endpoint:** `POST /notes`

**Authentication:** Required

**Request Body:**
```json
{
  "meetingId": "meeting_uuid",
  "content": "Meeting notes content...",
  "title": "Meeting Notes"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "meetingId": "meeting_uuid",
  "content": "Meeting notes content...",
  "title": "Meeting Notes",
  "createdBy": "user_uid",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Notes by Meeting

**Endpoint:** `GET /notes/meeting/:meetingId`

**Authentication:** Required

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Response (200):**
```json
[
  {
    "id": "uuid",
    "meetingId": "meeting_uuid",
    "content": "Meeting notes...",
    "title": "Notes",
    "createdBy": "user_uid",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Update Note

**Endpoint:** `PUT /notes/:noteId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `noteId` (string, required): Note ID

**Request Body:**
```json
{
  "content": "Updated content",
  "title": "Updated title"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "content": "Updated content",
  "title": "Updated title",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Note

**Endpoint:** `DELETE /notes/:noteId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `noteId` (string, required): Note ID

**Response (200):**
```json
{
  "message": "Note deleted successfully"
}
```

---

## Comments API

### Create Comment

**Endpoint:** `POST /comments`

**Authentication:** Required

**Request Body:**
```json
{
  "noteId": "note_uuid",
  "content": "This is a helpful comment"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "noteId": "note_uuid",
  "content": "This is a helpful comment",
  "author": "User Name",
  "createdBy": "user_uid",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### Get Comments by Note

**Endpoint:** `GET /comments/note/:noteId`

**Authentication:** Required

**Path Parameters:**
- `noteId` (string, required): Note ID

**Response (200):**
```json
[
  {
    "id": "uuid",
    "noteId": "note_uuid",
    "content": "Comment text",
    "author": "User Name",
    "createdBy": "user_uid",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Update Comment

**Endpoint:** `PUT /comments/:commentId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `commentId` (string, required): Comment ID

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "content": "Updated comment text",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

### Delete Comment

**Endpoint:** `DELETE /comments/:commentId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `commentId` (string, required): Comment ID

**Response (200):**
```json
{
  "message": "Comment deleted successfully"
}
```

---

## Recordings API

### Get All Recordings

**Endpoint:** `GET /recordings`

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "meetingId": "meeting_uuid",
    "title": "Meeting Recording",
    "url": "https://firebase-url...",
    "size": 52428800,
    "duration": 3600,
    "createdBy": "user_uid",
    "createdAt": "2024-01-15T10:00:00Z",
    "status": "completed"
  }
]
```

---

### Get Recordings by Meeting

**Endpoint:** `GET /recordings/meeting/:meetingId`

**Authentication:** Required

**Path Parameters:**
- `meetingId` (string, required): Meeting ID

**Response (200):**
```json
[
  {
    "id": "uuid",
    "meetingId": "meeting_uuid",
    "title": "Recording",
    "url": "https://...",
    "duration": 3600,
    "status": "completed"
  }
]
```

---

### Upload Recording

**Endpoint:** `POST /recordings/upload`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `recording` (file, required): Video file (.webm, .mp4, etc)
- `meetingId` (string, required): Meeting ID
- `title` (string, optional): Recording title

**Response (201):**
```json
{
  "id": "uuid",
  "meetingId": "meeting_uuid",
  "title": "Meeting Recording",
  "url": "https://firebase-signed-url...",
  "size": 52428800,
  "createdBy": "user_uid",
  "createdAt": "2024-01-15T10:00:00Z",
  "status": "completed"
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:5000/recordings/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "recording=@recording.webm" \
  -F "meetingId=meeting_uuid" \
  -F "title=My Meeting"
```

---

### Delete Recording

**Endpoint:** `DELETE /recordings/:recordingId`

**Authentication:** Required (must be creator)

**Path Parameters:**
- `recordingId` (string, required): Recording ID

**Response (200):**
```json
{
  "message": "Recording deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": "Title is required"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized: No token provided"
}
```

### 403 Forbidden

```json
{
  "error": "Only meeting creator can delete"
}
```

### 404 Not Found

```json
{
  "error": "Meeting not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

No rate limiting on free tier, but Firebase has quotas:

- **Firestore:**
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day

- **Storage:**
  - 5GB total storage
  - 1GB/day download

---

## Testing with cURL

### Create Meeting

```bash
curl -X POST http://localhost:5000/meetings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "roomCode": "ABC-123"
  }'
```

### Get All Meetings

```bash
curl -X GET http://localhost:5000/meetings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Note

```bash
curl -X POST http://localhost:5000/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "meeting_uuid",
    "content": "Test note",
    "title": "Test"
  }'
```

---

## JavaScript Client Examples

### Fetch Meetings

```javascript
const response = await fetch('http://localhost:5000/meetings', {
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
})
const meetings = await response.json()
```

### Create Note

```javascript
const response = await fetch('http://localhost:5000/notes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    meetingId: 'uuid',
    content: 'My notes',
    title: 'Notes'
  })
})
const note = await response.json()
```

### Upload Recording

```javascript
const formData = new FormData()
formData.append('recording', fileBlob)
formData.append('meetingId', 'uuid')
formData.append('title', 'Recording')

const response = await fetch('http://localhost:5000/recordings/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`
  },
  body: formData
})
const recording = await response.json()
```

---

## API Status

Check if backend is running:

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK"
}
```

---

**All endpoints are live and ready to use!**

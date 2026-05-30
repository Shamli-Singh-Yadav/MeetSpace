# Database Schema - MeetSpace

Complete Firestore database schema and design.

## Collections Overview

```
MeetSpace Database
│
├── meetings/
│   ├── {meetingId1}
│   ├── {meetingId2}
│   └── {meetingId3}
│
├── notes/
│   ├── {noteId1}
│   ├── {noteId2}
│   └── {noteId3}
│
├── comments/
│   ├── {commentId1}
│   ├── {commentId2}
│   └── {commentId3}
│
└── recordings/
    ├── {recordingId1}
    ├── {recordingId2}
    └── {recordingId3}
```

## Detailed Schema

### Meetings Collection

**Path:** `/meetings/{meetingId}`

**Document Structure:**

```javascript
{
  // Unique identifier (auto-generated UUID)
  id: string = "550e8400-e29b-41d4-a716-446655440000",
  
  // Meeting information
  title: string = "Project Planning Session",
  description: string = "Quarterly planning",
  
  // Room code for joining (e.g., ABC-123)
  roomCode: string = "ABC-123",
  
  // Creator user ID
  createdBy: string = "auth_uid_123",
  
  // Timestamps
  createdAt: timestamp = "2024-01-15T10:00:00Z",
  updatedAt: timestamp = "2024-01-15T10:30:00Z",
  
  // Participant management
  participants: array<string> = ["uid1", "uid2", "uid3"],
  participantCount: number = 3,
  
  // Meeting status
  status: enum = "active", // "active" | "ended" | "archived"
  
  // Meeting settings
  isRecordingEnabled: boolean = true,
  isChatEnabled: boolean = true,
  maxParticipants: number = 100,
  
  // Metadata
  duration: number = 3600, // in seconds
  endedAt: timestamp | null = null
}
```

**Indexes:**
```
1. createdBy + createdAt (composite)
2. participants (array)
3. status
4. roomCode (unique)
```

---

### Notes Collection

**Path:** `/notes/{noteId}`

**Document Structure:**

```javascript
{
  // Unique identifier
  id: string = "note_uuid_123",
  
  // Link to meeting
  meetingId: string = "meeting_uuid_123",
  
  // Note content
  title: string = "Meeting Notes",
  content: string = "Discussed Q1 roadmap...",
  
  // Creator information
  createdBy: string = "auth_uid_123",
  createdByName: string = "John Doe",
  
  // Timestamps
  createdAt: timestamp = "2024-01-15T10:00:00Z",
  updatedAt: timestamp = "2024-01-15T10:30:00Z",
  
  // Note metadata
  wordCount: number = 250,
  isEmpty: boolean = false,
  isArchived: boolean = false,
  
  // Tags for organization
  tags: array<string> = ["important", "action-items"]
}
```

**Indexes:**
```
1. meetingId + createdAt
2. createdBy + createdAt
3. isArchived
```

---

### Comments Collection

**Path:** `/comments/{commentId}`

**Document Structure:**

```javascript
{
  // Unique identifier
  id: string = "comment_uuid_123",
  
  // Link to note
  noteId: string = "note_uuid_123",
  
  // Comment content
  content: string = "Great point about Q1 goals",
  
  // Author information
  createdBy: string = "auth_uid_456",
  createdByEmail: string = "user@example.com",
  author: string = "Jane Smith", // Display name
  
  // Timestamps
  createdAt: timestamp = "2024-01-15T10:15:00Z",
  updatedAt: timestamp = "2024-01-15T10:20:00Z",
  
  // Comment metadata
  sentiment: enum = "positive", // "positive" | "neutral" | "negative"
  isEdited: boolean = false,
  
  // Thread reply support (optional)
  parentCommentId: string | null = null,
  replyCount: number = 0
}
```

**Indexes:**
```
1. noteId + createdAt
2. createdBy
3. parentCommentId
```

---

### Recordings Collection

**Path:** `/recordings/{recordingId}`

**Document Structure:**

```javascript
{
  // Unique identifier
  id: string = "recording_uuid_123",
  
  // Link to meeting
  meetingId: string = "meeting_uuid_123",
  
  // Recording information
  title: string = "Meeting Recording",
  description: string = "Recording of project planning",
  
  // Storage information
  url: string = "https://storage.googleapis.com/...",
  fileName: string = "recordings/user_uid/recording_id.webm",
  
  // File metadata
  size: number = 52428800, // in bytes (50MB)
  duration: number = 3600, // in seconds (1 hour)
  mimeType: string = "video/webm",
  
  // Creator information
  createdBy: string = "auth_uid_123",
  createdByName: string = "John Doe",
  
  // Timestamps
  createdAt: timestamp = "2024-01-15T10:30:00Z",
  updatedAt: timestamp = "2024-01-15T10:30:00Z",
  
  // Recording status
  status: enum = "completed", // "processing" | "completed" | "failed"
  
  // Metadata
  hasTranscript: boolean = false,
  transcriptUrl: string | null = null,
  uploadedSize: number = 52428800,
  uploadProgress: number = 100,
  
  // Retention settings
  expiresAt: timestamp | null = null,
  isPublic: boolean = false
}
```

**Indexes:**
```
1. meetingId + createdAt
2. createdBy + createdAt
3. status
4. expiresAt
```

---

## Relationships

### Meeting → Notes

```
Meeting (1)
  ↓ (1:N)
Notes (many)

meeting_uuid_123
  └── note_uuid_1 (meetingId: meeting_uuid_123)
  └── note_uuid_2 (meetingId: meeting_uuid_123)
  └── note_uuid_3 (meetingId: meeting_uuid_123)
```

### Note → Comments

```
Note (1)
  ↓ (1:N)
Comments (many)

note_uuid_1
  └── comment_uuid_1 (noteId: note_uuid_1)
  └── comment_uuid_2 (noteId: note_uuid_1)
```

### Meeting → Recordings

```
Meeting (1)
  ↓ (1:N)
Recordings (many)

meeting_uuid_123
  └── recording_uuid_1 (meetingId: meeting_uuid_123)
  └── recording_uuid_2 (meetingId: meeting_uuid_123)
```

---

## Data Integrity Rules

### Meeting Rules

1. `roomCode` must be unique
2. `participants` array contains only valid user UIDs
3. `createdBy` must be in `participants` initially
4. `participantCount` = `participants.length`
5. `status` transition: active → ended → archived (one way)

### Notes Rules

1. `meetingId` must reference existing meeting
2. `createdBy` must be participant in that meeting
3. `content` cannot exceed 100,000 characters
4. `title` cannot exceed 500 characters

### Comments Rules

1. `noteId` must reference existing note
2. `createdBy` user must exist
3. `content` cannot exceed 50,000 characters
4. If `parentCommentId` exists, it must reference existing comment

### Recordings Rules

1. `meetingId` must reference existing meeting
2. `url` must be valid signed URL
3. `size` cannot exceed 5GB
4. `duration` must be positive number
5. `status` must be: processing → completed OR failed

---

## Security Rules (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Meetings - users can only read their own meetings
    match /meetings/{meetingId} {
      allow create: if request.auth != null &&
                       request.resource.data.createdBy == request.auth.uid;
      allow read: if request.auth.uid in resource.data.participants;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Notes - users can only access notes for meetings they're in
    match /notes/{noteId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid == resource.data.createdBy;
      allow update: if request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Comments - users can read all, write their own
    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow read: if true;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
    
    // Recordings - users access their own recordings
    match /recordings/{recordingId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## Query Examples

### Get User's Meetings

```javascript
db.collection('meetings')
  .where('participants', 'array-contains', userId)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()
```

### Get Notes for Meeting

```javascript
db.collection('notes')
  .where('meetingId', '==', meetingId)
  .orderBy('createdAt', 'desc')
  .get()
```

### Get Comments for Note

```javascript
db.collection('comments')
  .where('noteId', '==', noteId)
  .orderBy('createdAt', 'asc')
  .get()
```

### Get User's Recordings

```javascript
db.collection('recordings')
  .where('createdBy', '==', userId)
  .where('status', '==', 'completed')
  .orderBy('createdAt', 'desc')
  .get()
```

### Get Active Meetings

```javascript
db.collection('meetings')
  .where('status', '==', 'active')
  .where('participants', 'array-contains', userId)
  .get()
```

---

## Firestore Indexes

### Composite Indexes to Create

1. **Meetings by Creator and Date**
   - Collection: meetings
   - Fields: createdBy (Asc), createdAt (Desc)

2. **Notes by Meeting and Date**
   - Collection: notes
   - Fields: meetingId (Asc), createdAt (Desc)

3. **Comments by Note and Date**
   - Collection: comments
   - Fields: noteId (Asc), createdAt (Asc)

4. **Recordings by Creator and Date**
   - Collection: recordings
   - Fields: createdBy (Asc), createdAt (Desc)

5. **Recordings by Status**
   - Collection: recordings
   - Fields: status (Asc), createdAt (Desc)

### Creating Indexes

Firestore automatically suggests indexes. When you run a query that needs an index:

1. Click the link in the error message
2. Click "Create Index"
3. Wait for index to build (usually a few minutes)

Or manually in Firebase Console:
1. Firestore → Indexes
2. "Create Index"
3. Select collection, fields, and order
4. Create

---

## Data Retention

### Automatic Cleanup

Set up Cloud Functions to:

1. **Archive old meetings**
   - Condition: status = 'ended' AND 30 days old
   - Action: Set status = 'archived'

2. **Delete old recordings** (optional)
   - Condition: 90 days old
   - Action: Delete recording

3. **Archive old notes**
   - Condition: 365 days old
   - Action: Set isArchived = true

---

## Storage Schema (Firebase Storage)

### Directory Structure

```
gs://bucket/
├── recordings/
│   ├── {userId1}/
│   │   ├── {recordingId1}.webm
│   │   ├── {recordingId2}.webm
│   │   └── {recordingId3}.webm
│   │
│   ├── {userId2}/
│   │   ├── {recordingId4}.webm
│   │   └── {recordingId5}.webm
│   └── ...
│
├── public/
│   └── (public files)
│
└── temp/
    └── (temporary uploads)
```

### File Naming Convention

```
recordings/{userId}/{recordingId}.webm
└── Prevents conflicts
└── Easy to identify owner
└── Supports permissions by path
```

---

## Migration Guide (if scaling)

### Moving from Firebase to PostgreSQL

If you need to migrate:

1. Export Firestore data as JSON
2. Transform to SQL format
3. Import to PostgreSQL
4. Update backend connection
5. Update security rules to database-specific

### Data Export Command

```bash
firestore-export --project YOUR_PROJECT_ID --output backup.json
```

---

## Best Practices

1. **Use Auto-IDs**: Let Firestore generate IDs (better for distribution)
2. **Denormalize Strategically**: Store frequently accessed data in documents
3. **Index Wisely**: Create indexes only for queries you actually use
4. **Archive Old Data**: Keep active collections lean
5. **Monitor Size**: Watch Firestore usage in console
6. **Set TTLs**: Auto-delete temporary data if needed

---

**Database schema is optimized for MeetSpace features!**

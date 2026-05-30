# Security Guide - MeetSpace

Security best practices and considerations for MeetSpace.

## Authentication Security

### Firebase Authentication

MeetSpace uses Firebase Authentication which provides:

✅ **What Firebase Provides:**
- Secure password hashing (bcrypt)
- Email verification
- Password reset functionality
- Session management
- Device tracking
- Suspicious activity detection
- OAuth 2.0 integration

### Secure Password Requirements

**Backend enforces:**
- Minimum 6 characters (Firebase minimum)
- Cannot be common passwords
- Rate limited attempts

**Frontend validation:**
- Show password strength indicator
- Require confirmation on signup

```javascript
// Password strength check
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  )
}
```

### Session Management

**ID Token:**
- Expires after 1 hour
- Automatically refreshed by Firebase SDK
- Secure, JWT-based
- Includes user UID and email

**Refresh Token:**
- Long-lived (default 30 days)
- Stored securely in device
- Used to get new ID token

**Best Practice:**
```javascript
// Always use refreshed token
const token = await auth.currentUser?.getIdToken()
headers.Authorization = `Bearer ${token}`
```

---

## Data Security

### Firestore Security Rules

**Public Data:** None (all data is private)

**Private Data:** Users only access their own

```javascript
// Restrict to creator
match /notes/{noteId} {
  allow read, write: if request.auth.uid == resource.data.createdBy;
}

// Restrict to participants
match /meetings/{meetingId} {
  allow read: if request.auth.uid in resource.data.participants;
}
```

### Firestore Best Practices

1. **Always verify user identity:**
   ```javascript
   if (request.auth.uid == resource.data.createdBy) {
     // Safe to proceed
   }
   ```

2. **Limit data per query:**
   ```javascript
   .limit(100) // Don't fetch all documents
   ```

3. **Use array-contains for security:**
   ```javascript
   where('participants', 'array-contains', userId)
   ```

4. **Validate field types:**
   ```javascript
   if (request.resource.data.title is string) {
     allow create;
   }
   ```

### Storage Security Rules

**Only allow users to upload their own recordings:**

```javascript
match /recordings/{userId}/{recordingId} {
  allow create: if request.auth.uid == userId &&
                   request.resource.size <= 104857600;
  allow read, delete: if request.auth.uid == userId;
}
```

**Signed URLs expire after 1 year** (configurable):

```javascript
const [url] = await file.getSignedUrl({
  version: 'v4',
  action: 'read',
  expires: Date.now() + 1000 * 60 * 60 * 24 * 365
})
```

---

## API Security

### Authentication Middleware

**Every protected endpoint requires token:**

```javascript
export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new Error('No token')
    
    const decodedToken = await auth.verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
```

### Authorization Checks

**Every resource operation verifies ownership:**

```javascript
// Delete note - must be creator
export const deleteNote = async (req, res, next) => {
  const userId = req.user.uid
  const noteDoc = await db.collection('notes').doc(noteId).get()
  
  if (noteDoc.data().createdBy !== userId) {
    return res.status(403).json({ error: 'Not authorized' })
  }
  
  // Safe to delete
  await noteDoc.ref.delete()
}
```

### CORS Protection

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### Input Validation

**Validate all incoming data:**

```javascript
export const createNote = async (req, res, next) => {
  const { meetingId, content } = req.body
  
  // Validate required fields
  if (!meetingId || !content) {
    throw new ValidationError('Missing required fields')
  }
  
  // Validate field types
  if (typeof content !== 'string' || content.length > 100000) {
    throw new ValidationError('Invalid content')
  }
  
  // Proceed safely
}
```

---

## Communication Security

### Socket.io Security

**Authenticate socket connections:**

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  
  try {
    const decoded = verifyIdToken(token)
    socket.userId = decoded.uid
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})
```

**Verify user permissions on events:**

```javascript
socket.on('join-meeting', (data) => {
  const { meetingId, userId } = data
  
  // Verify user is meeting participant
  const meeting = await db.collection('meetings').doc(meetingId).get()
  
  if (!meeting.data().participants.includes(socket.userId)) {
    socket.emit('error', 'Not a participant')
    return
  }
  
  // Safe to proceed
})
```

### WebRTC Encryption

**WebRTC is encrypted by default:**

- **DTLS (Datagram Transport Layer Security):**
  - Encrypts media streams
  - Certificate-based
  - No interception possible

- **SRTP (Secure Real-time Transport Protocol):**
  - Encrypts audio/video packets
  - Cannot eavesdrop on calls
  - Keys negotiated via DTLS

**For additional security:**
- Use TURN servers with credentials
- Verify peer fingerprints
- Use end-to-end encryption library if needed

---

## File Upload Security

### Recording Upload Protection

```javascript
const upload = multer({
  limits: {
    fileSize: 104857600 // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow video/audio
    if (file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only video/audio files allowed'))
    }
  }
})

router.post('/upload', upload.single('recording'), 
  async (req, res) => {
    const file = req.file
    
    // Verify file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large' })
    }
    
    // Verify file type again
    if (!file.mimetype.startsWith('video/')) {
      return res.status(400).json({ error: 'Invalid file type' })
    }
    
    // Upload to storage with user-specific path
    const fileName = `recordings/${req.user.uid}/${uuidv4()}.webm`
  }
})
```

---

## Environment Security

### Secure Configuration

**Never commit `.env` files:**

```bash
# .gitignore
.env
.env.local
serviceAccountKey.json
node_modules/
```

**Use environment variables for secrets:**

```javascript
const apiKey = process.env.FIREBASE_API_KEY
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

**Validate environment on startup:**

```javascript
const requiredEnv = [
  'FIREBASE_PROJECT_ID',
  'PORT',
  'CORS_ORIGIN'
]

requiredEnv.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`)
  }
})
```

### Firebase Admin SDK Security

**Only use on backend, never in frontend:**

```javascript
// ❌ WRONG - Exposes credentials
const admin = require('firebase-admin')
const key = require('./serviceAccountKey.json')

// ✅ RIGHT - Load from environment
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
})
```

---

## Network Security

### HTTPS/TLS

**All communication encrypted:**

- Frontend ↔ Backend: HTTPS (enforce redirects)
- Backend ↔ Firebase: HTTPS
- WebRTC: DTLS encryption

**Enable HSTS:**

```javascript
app.use((req, res, next) => {
  res.header('Strict-Transport-Security', 
    'max-age=31536000; includeSubDomains')
  next()
})
```

### Rate Limiting

**Protect against brute force attacks:**

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

app.use('/api/', limiter)
```

### DDoS Protection

**Use Vercel & Render's built-in DDoS protection**

- Automatic rate limiting
- Geographic filtering
- Bot detection

---

## Privacy Considerations

### Data Collection

**What's stored:**
- Email address
- User ID (Firebase UID)
- Meeting participation
- Notes content
- Recording metadata

**What's NOT stored:**
- Password (Firebase handles)
- Session tokens (Firebase manages)
- IP addresses (deleted after 30 days)

### Data Deletion

**User can request data deletion:**

```javascript
// Delete all user data
export const deleteUserData = async (userId) => {
  // Delete user's meetings
  await db.collection('meetings')
    .where('createdBy', '==', userId)
    .delete()
  
  // Delete user's notes
  await db.collection('notes')
    .where('createdBy', '==', userId)
    .delete()
  
  // Delete user's recordings
  const recordings = await db.collection('recordings')
    .where('createdBy', '==', userId)
    .get()
  
  for (const doc of recordings.docs) {
    await storage.bucket().file(doc.data().fileName).delete()
    await doc.ref.delete()
  }
  
  // Delete Firebase account
  await auth.deleteUser(userId)
}
```

### GDPR Compliance

✅ **MeetSpace is GDPR compliant:**

- Users can access their data (export)
- Users can delete their data (right to be forgotten)
- Data minimization (only essential data stored)
- Secure processing (HTTPS, encryption)
- Data protection agreement with Firebase

---

## Security Checklist

### Setup Phase
- [ ] Enable 2FA on Firebase account
- [ ] Set strong passwords
- [ ] Review Firebase security rules
- [ ] Configure Storage CORS rules
- [ ] Add environment variables to secrets manager
- [ ] Review API keys permissions

### Development Phase
- [ ] Add input validation everywhere
- [ ] Verify authentication on all endpoints
- [ ] Check authorization on all resources
- [ ] Add rate limiting
- [ ] Enable HTTPS locally (or use ngrok)
- [ ] Test with invalid tokens
- [ ] Test with unauthorized users

### Deployment Phase
- [ ] Set environment variables on deployment platform
- [ ] Enable HTTPS redirects
- [ ] Update CORS_ORIGIN for production
- [ ] Review and lock down security rules
- [ ] Enable backup & recovery
- [ ] Set up monitoring & alerts
- [ ] Test authentication flow end-to-end
- [ ] Review Firebase quotas

### Ongoing
- [ ] Monitor Firebase security alerts
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Audit security rules quarterly
- [ ] Stay informed about security updates

---

## Incident Response

### If Credentials are Compromised

1. **Immediately rotate credentials:**
   ```bash
   # Generate new service account key
   # Delete old key from Firebase Console
   # Update environment variables
   # Redeploy backend
   ```

2. **Monitor for unauthorized access:**
   - Check Firestore access logs
   - Look for unusual data modifications
   - Check Storage downloads

3. **Notify users** (if required by law)

### If Data Breach Occurs

1. **Assess scope:**
   - What data was accessed?
   - Which users affected?
   - How did breach occur?

2. **Contain breach:**
   - Revoke tokens
   - Reset passwords
   - Change credentials

3. **Notify authorities** (if required)

4. **Implement fixes:**
   - Patch vulnerability
   - Add monitoring
   - Update security rules

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security](https://firebase.google.com/support/security)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Security is a continuous process, not a one-time task!**

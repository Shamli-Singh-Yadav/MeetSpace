# Setup Guide - MeetSpace

Complete step-by-step guide to set up MeetSpace locally.

## Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)
- **Firebase Account** - [Sign up](https://firebase.google.com/)
- **Code Editor** - VS Code recommended

## Step 1: Firebase Project Setup

### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "MeetSpace")
4. Enable Google Analytics (optional)
5. Create project

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable these providers:
   - Email/Password
   - Google (optional)

### Set up Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose a location near you
5. Click **Create**

### Update Firestore Security Rules

1. In Firestore, go to **Rules**
2. Replace default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Meetings - users can read/write their own
    match /meetings/{meetingId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid in resource.data.participants;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }

    // Notes - users can read/write their own
    match /notes/{noteId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }

    // Comments - users can read/write their own
    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }

    // Recordings - users can read/write their own
    match /recordings/{recordingId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

3. Click **Publish**

### Set up Cloud Storage

1. Go to **Storage**
2. Click **Get started**
3. Accept default security rules
4. Choose a location near you
5. Click **Done**

### Update Storage Security Rules

1. In Storage, go to **Rules**
2. Replace default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Recordings - users can upload/download their own
    match /recordings/{userId}/{recordingId} {
      allow create: if request.auth.uid == userId && 
                       request.resource.size <= 104857600;
      allow read, delete: if request.auth.uid == userId;
    }

    // Public files - anyone can read
    match /public/{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

### Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Click **General** tab
3. Scroll to "Your apps"
4. Click **Web** icon to create web app
5. Register app with name "MeetSpace"
6. Copy the Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```


Keep this safe! You'll need it for the frontend.

### Generate Service Account Key (for Backend)

1. In Project Settings, go to **Service Accounts** tab
2. Click **Generate New Private Key**
3. Save the JSON file as `backend/serviceAccountKey.json`
4. ⚠️ **Keep this file secure!** Don't commit to Git!

## Step 2: Frontend Setup

### Clone and Install

```bash
# Clone repository (or create from files)
cd frontend
npm install
```

### Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in Firebase credentials in `.env`:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Start Frontend

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

## Step 3: Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Fill in environment variables:

```
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE=104857600
```

### Add Service Account Key

1. Move `serviceAccountKey.json` to `backend/` folder
2. Make sure `.gitignore` includes this file (don't commit!)

### Start Backend

```bash
npm run dev
```

Backend runs at `http://localhost:5000`

## Step 4: Test the Setup

### Create Account

1. Open `http://localhost:3000`
2. Click "Sign Up"
3. Enter email and password
4. Create account

### Create Meeting

1. Go to Dashboard
2. Click "Start a Meeting"
3. Enter a title
4. Click "Create"

### Join Meeting

1. You should be in the meeting room
2. Allow camera/microphone permissions
3. You should see your video

## Troubleshooting

### Issue: Firebase credentials not working
**Solution**: 
- Double-check all credentials in `.env`
- Make sure Firebase project is activated
- Check browser console for errors

### Issue: Backend can't connect to Firebase
**Solution**:
- Verify `serviceAccountKey.json` exists
- Check file is valid JSON
- Ensure service account has proper permissions

### Issue: Camera/Microphone not working
**Solution**:
- Allow browser permissions when prompted
- Check browser settings for camera access
- Refresh page and try again

### Issue: Socket.io connection fails
**Solution**:
- Verify backend is running (`http://localhost:5000/health`)
- Check CORS_ORIGIN in backend .env
- Look at browser console for errors

### Issue: Meetings not showing in list
**Solution**:
- Check Firestore has meetings collection
- Verify user is authenticated
- Check Firestore security rules

## Next Steps

1. **Read Documentation**:
   - [Architecture Guide](./ARCHITECTURE.md)
   - [API Reference](./API.md)
   - [WebRTC Guide](./WEBRTC_GUIDE.md)

2. **Customize**:
   - Update colors in `tailwind.config.js`
   - Change logo in `Navbar.jsx`
   - Modify default settings

3. **Deploy** (when ready):
   - Frontend to Vercel
   - Backend to Render or Railway
   - See [Deployment Guide](./DEPLOYMENT.md)

## Common Firebase Limits (Free Tier)

- **Firestore**: 50k reads, 20k writes, 20k deletes per day
- **Storage**: 5GB total storage
- **Real-time Database**: 100 concurrent connections
- **Authentication**: Unlimited free users

## Performance Tips

1. Use indexing for frequently queried fields
2. Limit chat history to last 100 messages
3. Compress recordings before upload
4. Use CDN for frontend (Vercel does this automatically)
5. Monitor Firestore usage in console

## Security Checklist

- ✅ Never commit `.env` files
- ✅ Never commit `serviceAccountKey.json`
- ✅ Use strong passwords
- ✅ Enable 2FA on Firebase account
- ✅ Review Firestore security rules regularly
- ✅ Don't expose API keys in code
- ✅ Use environment variables for all secrets

## Useful Commands

```bash
# Frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build

# Backend  
npm run dev      # Start dev server with watch
npm start        # Start production server
```

## Further Help

- Check browser console for errors
- Look at network tab in DevTools
- Review error messages carefully
- Check Firestore for data
- Enable debug logging in code

---

**You're all set! Happy coding! 🎉**

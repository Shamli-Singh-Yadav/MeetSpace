# Deployment Guide - MeetSpace

Complete guide to deploy MeetSpace to production using free services.

## Overview

- **Frontend**: Vercel (Free)
- **Backend**: Render or Railway (Free tier)
- **Database**: Firebase (Free tier)
- **Storage**: Firebase Storage (Free)

## Part 1: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
cd frontend

# Build for production
npm run build

# Test build locally
npm run preview
```

### Step 2: Push to GitHub

1. Create GitHub account if you don't have one
2. Create new repository "MeetSpace"
3. Push your code:

```bash
git remote add origin https://github.com/yourusername/MeetSpace.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your MeetSpace repository
5. Configure build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables:
   - `VITE_FIREBASE_API_KEY=your_value`
   - `VITE_FIREBASE_AUTH_DOMAIN=your_value`
   - `VITE_FIREBASE_PROJECT_ID=your_value`
   - `VITE_FIREBASE_STORAGE_BUCKET=your_value`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID=your_value`
   - `VITE_FIREBASE_APP_ID=your_value`
   - `VITE_API_URL=your_backend_url`
   - `VITE_SOCKET_URL=your_backend_url`
7. Click "Deploy"

Your frontend is now live at `https://yourproject.vercel.app`!

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Backend

1. Update backend `.env` for production:

```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_email
FIREBASE_STORAGE_BUCKET=your_bucket
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://yourproject.vercel.app
MAX_FILE_SIZE=104857600
```

2. Create `build.sh` in backend root:

```bash
#!/bin/bash
npm install
```

3. Create `.gitignore` in backend:

```
node_modules/
.env
.env.local
serviceAccountKey.json
*.log
dist/
```

4. Commit changes:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy on Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure service:
   - **Name**: meetspace-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
6. Add environment variables:
   - Copy all from your `.env` file
7. Create Web Service

Your backend is now live at `https://meetspace-backend.render.com`!

### Step 3: Update Vercel Environment

1. Go to Vercel project settings
2. Update environment variables:
   - `VITE_API_URL=https://meetspace-backend.render.com`
   - `VITE_SOCKET_URL=https://meetspace-backend.render.com`
3. Redeploy from Git

### Alternative: Deploy on Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Deploy from GitHub repo
5. Select backend folder
6. Configure environment variables
7. Deploy

## Part 3: Firebase Production Setup

### Security Rules

Update Firestore security rules for production:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /meetings/{meetingId} {
      allow create: if request.auth != null;
      allow read: if request.auth.uid in resource.data.participants;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }

    match /notes/{noteId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }

    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }

    match /recordings/{recordingId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /recordings/{userId}/{recordingId} {
      allow create: if request.auth.uid == userId &&
                       request.resource.size <= 104857600;
      allow read, delete: if request.auth.uid == userId;
    }
  }
}
```

### Enable CORS for Storage

Create `cors.json`:

```json
[
  {
    "origin": ["https://yourproject.vercel.app"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["Content-Type", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
```

Apply CORS:

```bash
gsutil cors set cors.json gs://your-bucket
```

## Part 4: Testing Production

### Frontend

1. Visit your Vercel URL
2. Test sign up / login
3. Create and join meetings
4. Test all features

### Backend

```bash
# Test backend is running
curl https://yourproject-backend.render.com/health

# Should return:
# {"status":"OK"}
```

### WebRTC

1. Test video/audio in meeting
2. Test screen sharing
3. Open two different browsers to test peer connection

### Chat & Recording

1. Send messages in meeting
2. Start and stop recording
3. Verify recordings appear in Recordings page

## Part 5: Custom Domain (Optional)

### Add Domain to Vercel

1. Go to Vercel project settings
2. Click "Domains"
3. Enter your domain (e.g., meetspace.com)
4. Follow DNS setup instructions
5. Wait for DNS to propagate

### Add Domain to Render Backend

1. Go to Render service settings
2. Click "Custom Domain"
3. Enter your domain (e.g., api.meetspace.com)
4. Update DNS records

## Part 6: Monitoring & Maintenance

### Monitor Vercel

- Dashboard shows deployments
- Analytics show usage
- Error tracking built-in

### Monitor Render

- View logs: Logs tab
- Monitor CPU/Memory: Metrics
- Set up alerts in Render

### Monitor Firebase

- Firestore: Database size & operations
- Storage: Storage used
- Authentication: Active users

## Part 7: Scaling Tips (When Needed)

### Free Tier Limits

**Firebase Firestore:**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day

**Firebase Storage:**
- 5GB total
- 1GB/day download

**Render Free:**
- Spins down after 15 min inactivity
- Limited to 1 free web service

### Upgrade Strategy

1. **Monitor usage** in Firebase Console
2. **When approaching limits**, upgrade Firestore plan
3. **If high traffic**, upgrade Render to paid tier
4. **For large storage**, switch to dedicated storage service

## Troubleshooting

### Vercel Deployment Issues

**Build fails**:
- Check build logs
- Verify environment variables
- Test `npm run build` locally

**Environment variables not working**:
- Check variable names
- Redeploy after changing
- Clear Vercel cache

### Render Deployment Issues

**Backend won't start**:
- Check logs for errors
- Verify service account key format
- Check all env variables are set

**Cold start delays**:
- Normal on free tier (30-60 seconds)
- Consider upgrade for production

### Firebase Issues

**CORS errors**:
- Update Storage CORS rules
- Update Backend CORS_ORIGIN
- Clear browser cache

**Authentication fails**:
- Check Firebase auth is enabled
- Verify API keys
- Check security rules

## Performance Optimization

### Frontend
- Enable Vercel Analytics
- Compress images
- Use Vercel edge caching

### Backend
- Use Render caching if available
- Optimize database queries
- Add Firestore indexes

### Database
- Add composite indexes
- Clean up old data regularly
- Archive old recordings

## Backup & Recovery

### Backup Firebase Data

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Export Firestore
firebase firestore:export gs://your-bucket/backup

# Export Authentication
# (Firebase Console → Download > Admin SDK)
```

### Backup Recordings

- Regularly download from Firebase Storage
- Keep local backup of important recordings
- Monitor storage usage

## Cost Estimation

**Monthly Costs (Estimated):**

- Vercel: Free for hobby projects
- Render: Free tier (0.5 CPU, 512MB RAM)
- Firebase: Mostly free, pay-per-use for overage
- **Total**: $0-50/month depending on usage

## Next Steps

1. **Monitor performance** in first month
2. **Gather user feedback**
3. **Make improvements**
4. **Plan scaling** if growth occurs
5. **Consider premium features**

## Support

- Vercel docs: https://vercel.com/docs
- Render docs: https://docs.render.com
- Firebase docs: https://firebase.google.com/docs

---

**Your app is now live! 🚀**

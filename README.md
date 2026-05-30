# MeetSpace

MeetSpace is a modern online meeting web application built with React, Tailwind, Node, Express, Socket.io, and Firebase. It supports authenticated meetings, room codes, WebRTC video/audio, chat, notes, recordings, and invite sharing.

## ✨ Key Features

- User signup, login, and secure session handling
- Create meetings with a generated room code
- Join meetings using a room code
- Real-time video and audio via WebRTC
- Live chat powered by Socket.io
- Meeting recording support
- Notes and comments tied to each meeting
- Dark glassmorphism dashboard and mobile-friendly UI

## 🛠️ Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Firebase Web SDK
- Socket.io client
- React Router

### Backend
- Node.js + Express
- Socket.io
- Firebase Admin SDK
- Firestore database
- Multer for uploads
- UUID for meeting IDs

## 📁 Project Structure

```
MeetSpace/
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.example
└── docs/
    ├── SETUP.md
    ├── DEPLOYMENT.md
    ├── API.md
    ├── ARCHITECTURE.md
    ├── WEBRTC_GUIDE.md
    └── SECURITY.md
```

## 🚀 Local Setup

### Prerequisites
- Node.js 16 or newer
- Firebase project with Firestore, Auth, and Storage
- Git

### Clone the repository

```bash
git clone https://github.com/yourusername/meetspace.git
cd "SmartMeet"
```

### Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Update `frontend/.env` with your Firebase client values.

Start the frontend:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend setup

```bash
cd ../backend
npm install
cp .env.example .env
```

Create a Firebase service account key in the Firebase console and save it as `serviceAccountKey.json` inside the `backend/` folder.

Update `backend/.env` with the required Firebase settings and local config.

Start the backend:

```bash
npm run dev
```

The backend runs at `http://localhost:7000`.

### Open the app

Visit `http://localhost:3000` in your browser.

## ⚠️ Important Notes

- Both frontend and backend must run together for the app to work correctly.
- Backend port is configured to `7000`.
- Do not commit the following sensitive files:
  - `frontend/.env`
  - `backend/.env`
  - `backend/serviceAccountKey.json`
  - `node_modules/`
  - build folders such as `dist/` or `build/`

The repository already includes `.gitignore` to exclude these files.

## 📌 Helpful commands

```bash
# frontend
cd frontend
npm install
npm run dev

# backend
cd backend
npm install
npm run dev
```

## 📚 Documentation

- `docs/SETUP.md` - setup and environment instructions
- `docs/DEPLOYMENT.md` - production deployment guidance
- `docs/API.md` - API reference for backend routes
- `docs/ARCHITECTURE.md` - system architecture and component flow
- `docs/SECURITY.md` - security best practices

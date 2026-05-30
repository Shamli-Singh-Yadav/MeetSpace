// src/App.jsx
// Main App component with routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MeetingProvider } from './context/MeetingContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { MeetingRoomPage } from './pages/MeetingRoomPage'
import { RecordingsPage } from './pages/RecordingsPage'
import { NotesPage } from './pages/NotesPage'

function App() {
  return (
    <Router>
      <AuthProvider>
        <MeetingProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/meeting/:meetingId"
                  element={
                    <ProtectedRoute>
                      <MeetingRoomPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recordings"
                  element={
                    <ProtectedRoute>
                      <RecordingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notes"
                  element={
                    <ProtectedRoute>
                      <NotesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </MeetingProvider>
      </AuthProvider>
    </Router>
  )
}

export default App

// src/pages/LandingPage.jsx
// Landing page for the application
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LandingPage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-5xl font-bold mb-4">MeetSpace</h1>
            <p className="text-xl mb-8 text-gray-100">
              Free, open-source video meetings with recording, chat, and note-taking. Everything you need for seamless online collaboration.
            </p>

            <div className="flex gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="space-y-6">
              <Feature
                icon="📹"
                title="HD Video Meetings"
                description="High-quality video and audio with WebRTC technology"
              />
              <Feature
                icon="💬"
                title="Live Chat"
                description="Real-time messaging with all participants"
              />
              <Feature
                icon="🎙️"
                title="Recording"
                description="Automatically record meetings for later playback"
              />
              <Feature
                icon="📝"
                title="Note Taking"
                description="Take and share notes during meetings"
              />
              <Feature
                icon="💬"
                title="Comments"
                description="Leave feedback and comments after meetings"
              />
              <Feature
                icon="🔒"
                title="Secure & Private"
                description="End-to-end encryption with open-source code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Feature = ({ icon, title, description }) => (
  <div className="flex gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
)

// src/components/MeetingControls.jsx
// Component for meeting control buttons (mic, camera, screen share, etc.)
import { useState } from 'react'

export const MeetingControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
  onLeave,
}) => {
  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-900 rounded-lg">
      {/* Microphone toggle */}
      <button
        onClick={onToggleMic}
        className={`p-3 rounded-full transition-colors ${
          isMuted
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isMuted ? (
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17a2 2 0 002 2h3a1 1 0 001-1v-2.5a1 1 0 011-1h2a1 1 0 011 1v2.5a1 1 0 001 1h3a2 2 0 002-2v-2.828l-8.38-8.379z" />
          ) : (
            <path d="M8 16A6 6 0 1020 10v1h-2v-1a4 4 0 00-7.28-1.47L9 11H7a1 1 0 000 2h2a3 3 0 003-3V8a1 1 0 10-2 0v3a1 1 0 11-2 0V7a1 1 0 10-2 0v5z" />
          )}
        </svg>
      </button>

      {/* Camera toggle */}
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full transition-colors ${
          isVideoOff
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isVideoOff ? 'Start Video' : 'Stop Video'}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isVideoOff ? (
            <path fillRule="evenodd" d="M4.31 6.471L2.707 4.929A1 1 0 002 5.586V14a2 2 0 002 2h12a2 2 0 001.707-.707l-1.414-1.414A1 1 0 0116 14v-3.5a1 1 0 10-2 0V14H6V6h5.5a1 1 0 100-2H6a2 2 0 00-2 2v8a1 1 0 01-1.69.71z" clipRule="evenodd" />
          ) : (
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12 0H4v8h12V6z" />
          )}
        </svg>
      </button>

      {/* Screen share toggle */}
      <button
        onClick={onToggleScreenShare}
        className={`p-3 rounded-full transition-colors ${
          isScreenSharing
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2h2V4a3 3 0 00-3-3H4a3 3 0 00-3 3v10a3 3 0 003 3h4v-2H4a1 1 0 01-1-1V4z" />
        </svg>
      </button>

      {/* Leave meeting */}
      <button
        onClick={onLeave}
        className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        title="Leave Meeting"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M3 6a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

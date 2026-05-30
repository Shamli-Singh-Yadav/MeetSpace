// src/components/RecordingButton.jsx
// Component for recording meeting controls
import { useState } from 'react'

export const RecordingButton = ({ isRecording, recordingTime, onStart, onStop }) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-red-600">
              Recording: {formatTime(recordingTime)}
            </span>
          </div>
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Stop Recording
          </button>
        </>
      ) : (
        <button
          onClick={onStart}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Start Recording
        </button>
      )}
    </div>
  )
}

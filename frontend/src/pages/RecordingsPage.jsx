// src/pages/RecordingsPage.jsx
// Page to view, manage, and playback recordings
import { useState, useEffect } from 'react'
import { recordingsAPI } from '../utils/api'

export const RecordingsPage = () => {
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRecording, setSelectedRecording] = useState(null)

  useEffect(() => {
    fetchRecordings()
  }, [])

  const fetchRecordings = async () => {
    try {
      setLoading(true)
      const response = await recordingsAPI.list()
      setRecordings(response.data)
    } catch (err) {
      setError('Failed to load recordings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recording?')) {
      return
    }

    try {
      await recordingsAPI.delete(id)
      setRecordings(recordings.filter((r) => r.id !== id))
      setSelectedRecording(null)
    } catch (err) {
      setError('Failed to delete recording')
      console.error(err)
    }
  }

  const handleDownload = async (recording) => {
    try {
      const response = await fetch(recording.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${recording.title}.webm`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download recording')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Recordings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recordings List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-2">Loading recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No recordings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recordings.map((recording) => (
                  <div
                    key={recording.id}
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedRecording?.id === recording.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {recording.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Duration:{' '}
                      {Math.floor(recording.duration / 60)}:
                      {String(recording.duration % 60).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recorded: {new Date(recording.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Player */}
          {selectedRecording && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedRecording.title}
              </h2>

              <video
                src={selectedRecording.url}
                controls
                className="w-full rounded-lg mb-4"
              />

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Duration:</strong>{' '}
                  {Math.floor(selectedRecording.duration / 60)}:
                  {String(selectedRecording.duration % 60).padStart(2, '0')}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {new Date(selectedRecording.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleDownload(selectedRecording)}
                  className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(selectedRecording.id)}
                  className="flex-1 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

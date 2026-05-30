// src/pages/NotesPage.jsx
// Page to view and manage notes from meetings
import { useState, useEffect } from 'react'
import { notesAPI, commentsAPI } from '../utils/api'

export const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    // In a real app, you'd load notes for a specific meeting
    // For now, we'll just load all notes
    fetchNotes()
  }, [])

  useEffect(() => {
    if (selectedNote) {
      fetchComments(selectedNote.id)
    }
  }, [selectedNote])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      // This endpoint would need to be adjusted based on your API
      // For now, assuming it returns all notes
      const response = await notesAPI.getByMeeting('')
      setNotes(response.data)
    } catch (err) {
      setError('Failed to load notes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (noteId) => {
    try {
      const response = await commentsAPI.getByMeeting(noteId)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments:', err)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedNote) return

    try {
      await commentsAPI.create({
        noteId: selectedNote.id,
        content: newComment,
      })

      setNewComment('')
      await fetchComments(selectedNote.id)
    } catch (err) {
      setError('Failed to add comment')
      console.error(err)
    }
  }

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return
    }

    try {
      await notesAPI.delete(id)
      setNotes(notes.filter((n) => n.id !== id))
      setSelectedNote(null)
    } catch (err) {
      setError('Failed to delete note')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Meeting Notes</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-2">Loading notes...</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedNote?.id === note.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedNote(note)}
                  >
                    <h3 className="font-semibold text-gray-800">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                      {note.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note Details and Comments */}
          {selectedNote && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedNote.title || 'Note'}
              </h2>

              {/* Note Content */}
              <div className="mb-6 p-3 bg-gray-50 rounded text-sm text-gray-700">
                {selectedNote.content}
              </div>

              {/* Delete Note Button */}
              <button
                onClick={() => handleDeleteNote(selectedNote.id)}
                className="w-full py-2 mb-6 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Note
              </button>

              {/* Comments Section */}
              <h3 className="font-semibold text-gray-800 mb-3">Comments</h3>

              {/* Comments List */}
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-2 bg-gray-50 rounded text-sm"
                    >
                      <p className="font-semibold text-gray-700">
                        {comment.author}
                      </p>
                      <p className="text-gray-600 mt-1">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// src/components/NoteEditor.jsx
// Component for editing meeting notes
import { useState } from 'react'

export const NoteEditor = ({ initialNotes = '', onSave, isSaving = false }) => {
  const [notes, setNotes] = useState(initialNotes)

  const handleSave = () => {
    onSave(notes)
  }

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-800">Meeting Notes</h3>
      
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type your notes here... (Auto-saves)"
        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {notes.length} characters
        </span>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400"
        >
          {isSaving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  )
}

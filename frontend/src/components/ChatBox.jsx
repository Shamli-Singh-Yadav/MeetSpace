// src/components/ChatBox.jsx
// Component for real-time chat during meetings
import { useRef, useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export const ChatBox = ({ messages, onSendMessage }) => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800">{msg.sender}</span>
                <span className="text-gray-500 text-xs">
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-700 mt-1">{msg.message}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}

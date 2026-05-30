// src/context/MeetingContext.jsx
// Meeting context for managing meeting-related state
import React, { createContext, useState } from 'react'

export const MeetingContext = createContext()

export const MeetingProvider = ({ children }) => {
  const [currentMeeting, setCurrentMeeting] = useState(null)
  const [participants, setParticipants] = useState([])
  const [messages, setMessages] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  // Add participant
  const addParticipant = (participant) => {
    setParticipants((prev) => {
      // Prevent duplicates
      if (prev.find((p) => p.id === participant.id)) {
        return prev
      }
      return [...prev, participant]
    })
  }

  // Remove participant
  const removeParticipant = (participantId) => {
    setParticipants((prev) => prev.filter((p) => p.id !== participantId))
  }

  // Add message
  const addMessage = (message) => {
    setMessages((prev) => [...prev, message])
  }

  // Clear messages
  const clearMessages = () => {
    setMessages([])
  }

  const value = {
    currentMeeting,
    setCurrentMeeting,
    participants,
    addParticipant,
    removeParticipant,
    messages,
    addMessage,
    clearMessages,
    isRecording,
    setIsRecording,
    recordingTime,
    setRecordingTime,
  }

  return <MeetingContext.Provider value={value}>{children}</MeetingContext.Provider>
}

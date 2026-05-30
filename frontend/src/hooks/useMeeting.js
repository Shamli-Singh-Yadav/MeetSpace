// src/hooks/useMeeting.js
// Custom hook for using meeting context
import { useContext } from 'react'
import { MeetingContext } from '../context/MeetingContext'

export const useMeeting = () => {
  const context = useContext(MeetingContext)
  if (!context) {
    throw new Error('useMeeting must be used within MeetingProvider')
  }
  return context
}

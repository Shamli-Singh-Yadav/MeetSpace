// src/utils/roomCode.js
// Utility functions for generating and validating room codes

export const generateRoomCode = () => {
  // Generate a 6-character room code (e.g., ABC-123)
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code.substring(0, 3) + '-' + code.substring(3)
}

export const validateRoomCode = (code) => {
  // Validate format: XXX-XXX (3 chars, dash, 3 chars)
  const regex = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/
  return regex.test(code)
}

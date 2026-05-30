// src/middleware/errorHandler.js
// Global error handling middleware

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message,
    })
  }

  // Custom AppError
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
  })
}

// 404 handler
export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Route not found',
  })
}

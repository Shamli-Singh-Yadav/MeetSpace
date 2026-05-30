// src/components/VideoElement.jsx
// Component to display video streams from peers
import { useRef, useEffect } from 'react'

export const VideoElement = ({ stream, isLocal = false, label = 'User' }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay={true}
        muted={isLocal}
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm">
        {label} {isLocal && '(You)'}
      </div>
    </div>
  )
}

// src/components/VideoGrid.jsx
// Component to display multiple video streams in a grid
import { VideoElement } from './VideoElement'

export const VideoGrid = ({ participants, localStream, userName }) => {
  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 h-full">
        {/* Local video - always show first */}
        {localStream && (
          <VideoElement stream={localStream} isLocal={true} label={userName} />
        )}

        {/* Remote participants */}
        {participants.map((participant) => (
          <VideoElement
            key={participant.id}
            stream={participant.stream}
            label={participant.name}
          />
        ))}

        {/* Empty slots message if no participants */}
        {participants.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-48">
            <p className="text-white text-center">
              Waiting for participants to join...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

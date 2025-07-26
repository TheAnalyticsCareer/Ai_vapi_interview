import { useRef, useEffect, useState } from 'react';
import { User } from 'lucide-react';

interface VideoSectionProps {
  isCameraOn: boolean;
  isAISpeaking: boolean;
  isInterviewActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  onStreamReady: (stream: MediaStream | null) => void;
}

const VideoSection = ({ 
  isCameraOn, 
  isAISpeaking, 
  isInterviewActive, 
  connectionStatus,
  onStreamReady 
}: VideoSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      onStreamReady(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      onStreamReady(null);
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected to AI';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="flex-1 relative w-full h-full aspect-video bg-gray-800 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      {!isCameraOn && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <User className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-sm md:text-base">Camera is off</p>
          </div>
        </div>
      )}

      {/* AI Interviewer Box - Responsive */}
      <div className="absolute top-4 right-4 w-28 h-20 sm:w-36 sm:h-28 md:w-48 md:h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center p-2">
        <div className="text-center">
          <img
            src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
            alt="Logo"
            className="h-8 sm:h-10 md:h-12 mx-auto mb-1 object-contain"
          />
          <p className="text-xs sm:text-sm text-gray-300">AI Interviewer</p>

          {isAISpeaking && (
            <div className="mt-1">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse mx-auto"></div>
              <p className="text-[10px] sm:text-xs text-green-400 mt-0.5">Speaking...</p>
            </div>
          )}

          {isInterviewActive && !isAISpeaking && (
            <div className="mt-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
              <p className="text-[10px] sm:text-xs text-blue-400 mt-0.5">Listening...</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></div>
          <span className="text-xs text-white">{getConnectionStatusText()}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;

import { Button } from '@/components/ui/button';
import { Camera, CameraOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

interface InterviewControlsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  isInterviewActive: boolean;
  isLoading: boolean;
  hasMediaStream: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onStartInterview: () => void;
  onEndInterview: () => void;
}

const InterviewControls = ({
  isCameraOn,
  isMicOn,
  isInterviewActive,
  isLoading,
  hasMediaStream,
  onToggleCamera,
  onToggleMic,
  onStartInterview,
  onEndInterview,
}: InterviewControlsProps) => {
  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex flex-wrap justify-center gap-4">
        {/* Mic Toggle */}
        <Button
          onClick={onToggleMic}
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="lg"
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
          disabled={!hasMediaStream}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        {/* Camera Toggle */}
        <Button
          onClick={onToggleCamera}
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="lg"
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
          disabled={!hasMediaStream}
        >
          {isCameraOn ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
        </Button>

        {/* Start or End Interview */}
        {!isInterviewActive ? (
          <Button
            onClick={onStartInterview}
            disabled={isLoading || !hasMediaStream}
            size="lg"
            className="bg-green-600 hover:bg-green-700 rounded-full h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <Phone className="h-5 w-5 mr-2" />
                <span className="hidden xs:inline">Start</span>
                <span className="hidden sm:inline">&nbsp;Interview</span>
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onEndInterview}
            disabled={isLoading}
            size="lg"
            className="bg-red-600 hover:bg-red-700 rounded-full h-12 sm:h-14 px-6 sm:px-8 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <>
                <PhoneOff className="h-5 w-5 mr-2" />
                <span className="hidden xs:inline">End</span>
                <span className="hidden sm:inline">&nbsp;Interview</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InterviewControls;

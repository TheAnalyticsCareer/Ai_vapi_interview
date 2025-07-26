import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
// import { useVoiceAI } from "@/hooks/useVoiceAI";
import { useVapi } from "@/hooks/useVapi";
import { generateFeedback, generateInterviewerQuestion } from "@/lib/gemini";
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import VideoSection from '@/components/interview/VideoSection';
import InterviewControls from '@/components/interview/InterviewControls';
import TranscriptPanel from '@/components/interview/TranscriptPanel';
import { ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input'; // Make sure you have this component
import { Button } from '@/components/ui/button'; // For the send button

const Interview = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Vapi voice interview integration ONLY
  const {
    isInterviewActive: vapiInterviewActive,
    isAISpeaking: vapiAISpeaking,
    connectionStatus: vapiConnectionStatus,
    transcript: vapiTranscript,
    handleStartInterview: vapiStartInterview,
    handleStopInterview: vapiStopInterview,
    setupVapiEventListeners
  } = useVapi();
  // Automatically set up Vapi listeners on mount
  useEffect(() => {
    setupVapiEventListeners();
  }, [setupVapiEventListeners]);

  // Move mediaStream state above any useEffect that references it
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  useEffect(() => {
    setMediaReady(!!mediaStream);
  }, [mediaStream]);

  // Use Vapi transcript for conversation (no local conversation state needed)

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  // (mediaStream state already declared above)
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // const [typedAnswer, setTypedAnswer] = useState(""); // removed, Vapi handles all input

  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const role = location.state?.role || 'Software Developer';
  const roleDescription = location.state?.roleDescription || '';
  const interviewId = location.state?.interviewId || id;

  // Remove browser voice/voice selection logic

  useEffect(() => {
    console.log('Interview component mounted');
    console.log('Interview ID:', interviewId);
    console.log('Role:', role);
    return () => {
      // Stop media tracks
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      // Clear duration interval
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      // Stop the interview and AI speaking if still active
      vapiStopInterview();
    };
  }, [mediaStream, interviewId, role, vapiStopInterview]);

  const createInterviewRecord = async () => {
    if (!interviewId || !user) return;
    
    try {
      const interviewData = {
        id: interviewId,
        userId: user.uid,
        candidateName: user.email || 'Anonymous',
        role: role,
        status: 'in_progress',
        startTime: new Date().toISOString(),
        transcript: '',
        duration: 0,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'interviews', interviewId), interviewData);
      console.log('Interview record created successfully');
    } catch (error) {
      console.error('Error creating interview record:', error);
    }
  };

  // Vapi handles interview start
  const handleStartInterview = async () => {
    if (!mediaStream) {
      toast({
        title: "Media Access Required",
        description: "Please allow camera and microphone access to start the interview",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      await createInterviewRecord();
      setInterviewStartTime(new Date());
      setIsInterviewActive(true);
      setConnectionStatus('connected');
      setIsAISpeaking(true);
      durationInterval.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      toast({
        title: "Interview Started",
        description: `The AI interviewer for ${role} position should start speaking shortly.`,
      });
      // Vapi will handle the rest
      vapiStartInterview(role, roleDescription);
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Failed to Start Interview",
        description: "There was an error starting the interview. Please check your internet connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndInterview = async () => {
    setIsLoading(true);
    try {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      setIsInterviewActive(false);
      setConnectionStatus('disconnected');
      // Save transcript (from Vapi) to Firestore
      if (interviewId && user) {
        const finalTranscript = Array.isArray(vapiTranscript) ? vapiTranscript.join('\n') : (vapiTranscript || 'No transcript available');
        await updateDoc(doc(db, 'interviews', interviewId), {
          status: 'completed',
          endTime: new Date().toISOString(),
          transcript: finalTranscript,
          duration: duration
        });
      }
      toast({
        title: "Interview Completed",
        description: "Generating your feedback...",
      });
      // Navigate to feedback page with transcript and details
      navigate(`/feedback/${interviewId}`, {
        state: {
          transcript: Array.isArray(vapiTranscript) ? vapiTranscript.join('\n') : vapiTranscript,
          role,
          duration,
          candidateName: user?.email || 'Candidate'
        }
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: "Error Ending Interview",
        description: "There was an issue ending the interview, but your data has been saved.",
        variant: "destructive",
      });
      // Still navigate to feedback even if there was an error
      navigate(`/feedback/${interviewId}`, {
        state: {
          transcript: Array.isArray(vapiTranscript) ? vapiTranscript.join('\n') : 'Interview completed with some technical issues',
          role,
          duration,
          candidateName: user?.email || 'Candidate'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // All browser voice/manual transcript logic removed. Vapi handles all voice and transcript.

  // Remove any lingering useEffect or code referencing `listening` or `transcript` (browser voice)
  // (No such code should remain, but double-check for any missed lines)

  const toggleCamera = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCameraOn;
        setIsCameraOn(!isCameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Example: After transcript is set, send to backend (removed, Vapi handles this)

  const INSTRUCTIONS = [
    "1. Make sure your camera and microphone are enabled.",
    "2. The AI interviewer will begin by asking for your name and background.",
    "3. Answer each question clearly. You can reply by voice or by typing.",
    "4. Wait for the AI to finish speaking before you answer.",
    "5. You can switch between English and Hindi before starting.",
    "6. Click 'End Interview' when you are done.",
    "7. After the interview, you will receive detailed AI feedback.",
    "8. If you face any issues, refresh the page and try again.",
  ];

 return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#15192c] via-[#232d4d] to-[#20202b] flex flex-col items-center justify-start transition-all duration-500">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mt-2 px-2 sm:px-4">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
          <button
            className="rounded-full bg-black/30 hover:bg-black/50 p-2 transition-colors"
            onClick={() => window.history.back()}
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl text-red-500 font-bold tracking-tight flex items-center gap-2">
              AI Interview
              <Badge variant="secondary" className="ml-2 px-2 sm:px-4 py-1 text-sm sm:text-base rounded-lg tracking-widest">
                {role}
              </Badge>
            </h1>
            {roleDescription && (
              <p className="text-gray-400 text-sm sm:text-base ml-0 sm:ml-6">{roleDescription}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              className="rounded-lg border border-gray-800 bg-gray-800/60 px-3 py-1 flex items-center gap-2 shadow-inner"
              title="Interview Duration"
            >
              <span className="font-mono text-lg text-white">{formatDuration(duration)}</span>
            </div>

            {isInterviewActive && (
              <div className="flex items-center gap-2 bg-red-700/60 px-2 py-1 rounded-lg animate-pulse border border-red-700 shadow-md">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-red-100">Recording</span>
              </div>
            )}

            {isAISpeaking && (
              <div className="flex items-center gap-2 bg-green-700/60 px-2 py-1 rounded-lg border border-green-700 shadow-md">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wide text-green-100">AI Speaking</span>
              </div>
            )}
          </div>
        </div>
        {/* --- Language and Voice Selection Dropdowns REMOVED --- */}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6 mt-4 px-2 sm:px-4">
        {/* Video Section */}
        <div className="flex-[2.8] flex flex-col rounded-2xl bg-black/30 shadow-2xl backdrop-blur-lg border border-gray-800/50 overflow-hidden min-h-[340px] sm:min-h-[420px] md:min-h-[600px] max-h-[900px] transition-all duration-300">
          <VideoSection
            isCameraOn={isCameraOn}
            isAISpeaking={isAISpeaking}
            isInterviewActive={isInterviewActive}
            connectionStatus={connectionStatus}
            onStreamReady={setMediaStream}
          />

          <div className="border-t border-gray-700/60 bg-gradient-to-t from-gray-800/60 to-transparent w-full">
            <InterviewControls
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isInterviewActive={isInterviewActive}
              isLoading={isLoading}
              hasMediaStream={!!mediaStream}
              onToggleCamera={toggleCamera}
              onToggleMic={toggleMic}
              onStartInterview={handleStartInterview}
              onEndInterview={handleEndInterview}
            />
          </div>
        </div>

        {/* Transcript Panel */}
        <div className="w-full sm:w-[100%] md:w-[480px] lg:w-[520px] rounded-2xl shadow-2xl border border-gray-800/40 overflow-hidden bg-black/30 backdrop-blur-lg mt-4 lg:mt-0 flex flex-col min-h-[260px] md:min-h-[340px] max-h-[900px] transition-all duration-300">
          <TranscriptPanel transcript={vapiTranscript} isInterviewActive={isInterviewActive} />
        </div>

        {/* Instructions Panel - right side */}
        <div className="w-full sm:w-[98%] md:w-[320px] mt-4 lg:mt-0 flex flex-col">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg shadow p-4 h-auto min-h-[180px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[320px] xl:min-h-[380px] 2xl:min-h-[420px] flex flex-col justify-start">
            <h2 className="text-lg font-bold text-yellow-800 mb-2">Interview Instructions</h2>
            <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1">
              {INSTRUCTIONS.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Background Animations */}
      <div className="fixed left-2 top-20 z-0 w-40 h-40 rounded-full bg-blue-700/20 blur-2xl animate-pulse pointer-events-none" />
      <div className="fixed right-2 bottom-8 z-0 w-56 h-32 rounded-full bg-pink-500/10 blur-2xl animate-[pulse_7s_ease-in-out_infinite]" />
    </div>
  );
};

export default Interview;

// speak function removed; Vapi handles all voice output

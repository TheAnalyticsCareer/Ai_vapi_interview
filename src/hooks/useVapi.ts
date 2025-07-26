import { useState, useEffect, useCallback } from 'react';
import { vapi, startInterview, stopInterview } from '@/lib/vapi';
import { toast } from '@/hooks/use-toast';

export const useVapi = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [transcript, setTranscript] = useState<string[]>([]);

  const setupVapiEventListeners = useCallback(() => {
    console.log('Setting up Vapi event listeners...');
    
    // Remove existing listeners to prevent duplicates
    vapi.removeAllListeners();
    
    vapi.on('call-start', () => {
      console.log('Vapi call started - AI should begin speaking');
      setIsInterviewActive(true);
      setConnectionStatus('connected');
      toast({
        title: "Interview Started",
        description: "AI interviewer is now active and should start speaking",
      });
    });

    vapi.on('speech-start', () => {
      console.log('AI started speaking');
      setIsAISpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('AI finished speaking');
      setIsAISpeaking(false);
    });

    // Handle AI responses - only add final transcripts to avoid repetition
    vapi.on('message', (message: any) => {
      console.log('Vapi message received:', message);
      
      // Handle different message types
      if (message.type === 'transcript') {
        if (message.transcript && message.transcript.trim()) {
          const transcriptText = message.transcript.trim();
          
          // Only add FINAL transcripts to avoid accumulation and repetition
          if (message.transcriptType === 'final') {
            const speaker = message.role === 'assistant' ? 'AI Interviewer' : 'You';
            const entry = `${speaker}: ${transcriptText}`;
            
            console.log('Adding final transcript entry:', entry);
            setTranscript(prev => {
              // Avoid duplicates by checking if this exact entry already exists
              if (prev.includes(entry)) {
                console.log('Duplicate entry detected, skipping:', entry);
                return prev;
              }
              return [...prev, entry];
            });
          } else {
            // Log partial transcripts for debugging but don't add to transcript
            console.log('Partial transcript (not added):', message.role, transcriptText);
          }
        }
      }
      
      // Handle assistant messages (AI responses)
      if (message.type === 'assistant-request' || message.type === 'function-call') {
        console.log('AI is processing/responding');
        setIsAISpeaking(true);
      }
      
      // Handle conversation updates
      if (message.type === 'conversation-update') {
        console.log('Conversation update:', message);
      }
    });

    vapi.on('call-end', () => {
      console.log('Vapi call ended');
      setIsInterviewActive(false);
      setIsAISpeaking(false);
      setConnectionStatus('disconnected');
      toast({
        title: "Interview Ended",
        description: "The interview session has been completed",
      });
    });

    vapi.on('error', (error: any) => {
      console.error('Vapi error:', error);
      setConnectionStatus('disconnected');
      setIsInterviewActive(false);
      setIsAISpeaking(false);
      
      let errorMessage = "There was an issue with the voice connection. Please try again.";
      
      if (error?.error?.message?.includes('Wallet Balance is 0')) {
        errorMessage = "Insufficient Vapi credits. Please add credits to your Vapi account to use the voice interview feature.";
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }
      
      toast({
        title: "Voice Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
    });

    // Additional event listeners for better debugging
    vapi.on('volume-level', (level: number) => {
      console.log('Volume level:', level);
    });

  }, []);

  const handleStartInterview = useCallback(async (role: string = 'Software Developer', roleDescription: string = '') => {
    console.log('Starting interview for role:', role);
    setConnectionStatus('connecting');
    
    try {
      const success = await startInterview(undefined, role, roleDescription);
      if (success) {
        console.log('Interview started successfully. AI should begin speaking immediately.');
        return true;
      } else {
        throw new Error('Failed to start interview');
      }
    } catch (error: any) {
      console.error('Error starting interview:', error);
      setConnectionStatus('disconnected');
      let errorMessage = "Please check your microphone permissions and internet connection, then try again";
      if (error.message?.includes('Insufficient Vapi credits')) {
        errorMessage = "The Vapi account has insufficient credits. Please add credits to your Vapi account or contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Failed to Start Interview",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  }, [isAISpeaking]);

  const handleStopInterview = useCallback(async () => {
    console.log('Stopping interview...');
    
    try {
      await stopInterview();
      setIsInterviewActive(false);
      setIsAISpeaking(false);
      setConnectionStatus('disconnected');
      return true;
    } catch (error) {
      console.error('Error stopping interview:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    setupVapiEventListeners();
    
    return () => {
      console.log('Cleaning up Vapi listeners');
      vapi.removeAllListeners();
    };
  }, [setupVapiEventListeners]);

  return {
    isInterviewActive,
    isAISpeaking,
    connectionStatus,
    transcript,
    handleStartInterview,
    handleStopInterview,
    setupVapiEventListeners
  };
};

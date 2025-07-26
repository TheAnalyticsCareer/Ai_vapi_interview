import { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic } from 'lucide-react';

interface TranscriptPanelProps {
  transcript: string[];
  isInterviewActive: boolean;
}

const TranscriptPanel = ({ transcript, isInterviewActive }: TranscriptPanelProps) => {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="w-full md:w-97 bg-gray-800 border-l border-gray-700 flex flex-col h-full min-h-[400px] max-h-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-blue-500">Live Transcript</h3>
        <p className="text-sm text-gray-400">Real-time conversation</p>
      </div>
      
      <div
        ref={transcriptRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] min-h-[200px]"
      >
        {transcript.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="h-6 w-6" />
            </div>
            <p className="text-gray-400">
              {isInterviewActive 
                ? "Conversation will appear here..." 
                : "Start the interview to see transcript"
              }
            </p>
          </div>
        ) : (
          transcript.map((entry, index) => {
            const isAI = entry.startsWith('AI Interviewer:');
            return (
              <Card key={index} className={`${isAI ? 'bg-blue-900/30 border-blue-600/30' : 'bg-gray-700 border-gray-600'}`}>
                <CardContent className="p-3">
                  <p className="text-sm text-gray-200">{entry}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;

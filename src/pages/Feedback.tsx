import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateFeedback } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Clock, 
  User, 
  Briefcase,
  Home,
  ChevronLeft,
  RefreshCw,
  Calendar,
  Target,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackData {
  overallRating: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  technicalSkills: string;
  communicationSkills: string;
  recommendations: string;
  interviewInsights?: string;
  nextSteps?: string;
}

const Feedback = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [interviewData, setInterviewData] = useState<any>(null);

  // Remove this line:
  // const transcript = location.state?.transcript || '';
  // Instead, always use interviewData.transcript if available:
  const role = location.state?.role || interviewData?.role || 'Software Developer';
  const duration = location.state?.duration || interviewData?.duration || 0;
  const candidateName = location.state?.candidateName || interviewData?.candidateName || 'Candidate';

  // Always use transcript from Firestore if available
  const transcript = interviewData?.transcript || location.state?.transcript || '';

  // --- Add transcript splitting logic ---
  // The transcript, as stored in the DB/location, may be a string or array.
  // We'll support both, but prefer array. If it's a string, split by newlines and remove empties.
  const getTranscriptArray = () => {
    if (Array.isArray(transcript)) return transcript;
    if (typeof transcript === "string") {
      // Split on line breaks or numbered lists
      return transcript
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    if (id) {
      loadFeedback();
    }
  }, [id]);

  const generateNewFeedback = async (transcriptData: string, roleData: string, candidateNameData: string) => {
    console.log('Generating comprehensive AI feedback with data:', { 
      transcriptLength: transcriptData?.length || 0, 
      role: roleData, 
      candidateName: candidateNameData 
    });
    
    if (!transcriptData || transcriptData.trim().length === 0) {
      throw new Error('No interview transcript available for AI analysis. Please ensure the interview was properly recorded.');
    }
    
    try {
      const feedbackData = await generateFeedback(transcriptData, roleData, candidateNameData);
      console.log('Comprehensive AI feedback generated successfully:', feedbackData);
      return feedbackData;
    } catch (error) {
      console.error('AI feedback generation failed:', error);
      throw error;
    }
  };

  const loadFeedback = async () => {
    try {
      setLoading(true);

      if (!id) {
        throw new Error('No interview ID provided');
      }

      // Get interview data from database
      const interviewDoc = await getDoc(doc(db, 'interviews', id));

      if (interviewDoc.exists()) {
        const data = interviewDoc.data();
        setInterviewData(data);
        console.log('Interview data loaded:', data);

        // If feedback already exists, use it and do NOT regenerate
        if (data.feedback) {
          setFeedback(data.feedback);
          return;
        }

        // Only generate feedback if missing
        const transcriptToUse = data.transcript || transcript;
        const roleToUse = data.role || role;
        const candidateNameToUse = data.candidateName || candidateName;

        if (!transcriptToUse || transcriptToUse.trim().length === 0) {
          throw new Error('No interview transcript found. AI feedback requires actual interview content to analyze.');
        }

        console.log('Generating comprehensive AI feedback for actual interview content');

        const feedbackData = await generateNewFeedback(transcriptToUse, roleToUse, candidateNameToUse);

        // Save new AI-generated feedback to database
        await updateDoc(doc(db, 'interviews', id), {
          feedback: feedbackData,
          score: parseInt(feedbackData.overallRating) || 7,
          feedbackGeneratedAt: new Date().toISOString()
        });

        setFeedback(feedbackData);
        toast({
          title: "AI Feedback Generated",
          description: "Comprehensive interview analysis completed using actual interview content!",
        });

      } else {
        throw new Error('Interview record not found. Cannot generate AI feedback without interview data.');
      }

    } catch (error) {
      console.error('Error loading/generating AI feedback:', error);
      toast({
        title: "AI Feedback Generation Failed", 
        description: error instanceof Error ? error.message : "Failed to generate AI feedback from interview content.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetryFeedback = async () => {
    setRetrying(true);
    await loadFeedback();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingProgress = (rating: number) => {
    return (rating / 10) * 100;
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 8) return 'Very Good';
    if (rating >= 7) return 'Good';
    if (rating >= 6) return 'Satisfactory';
    if (rating >= 5) return 'Needs Improvement';
    return 'Poor';
  };

  const getInterviewDate = () => {
    if (interviewData?.startTime) {
      return new Date(interviewData.startTime).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {retrying ? "Regenerating AI feedback from interview content..." : "AI is analyzing your actual interview transcript..."}
          </p>
          <p className="text-sm text-gray-500 mt-2">Creating personalized feedback based on your responses</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">AI Analysis Required</h2>
            <p className="text-gray-600 mb-4">AI feedback requires actual interview transcript data for analysis.</p>
            <div className="space-y-2">
              <Button onClick={handleRetryFeedback} disabled={retrying} className="w-full">
                {retrying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Interview Content...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate AI Analysis
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Custom AI score based on transcript length
  const transcriptArr = getTranscriptArray();
  const transcriptLength = transcriptArr.length;
  const getTranscriptScore = (length: number) => {
    if (length < 7) return 0;
    if (length < 10) return 1;
    if (length < 15) return 2;
    if (length < 20) return 3;
    if (length < 25) return 4;
    if (length < 30) return 5;
    if (length < 35) return 6;
    if (length < 40) return 7;
    if (length < 50) return 8;
    return 0;
  };
  const rating = getTranscriptScore(transcriptLength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Responsive Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Back
              </Button>
              <img
                src="https://d502jbuhuh9wk.cloudfront.net/logos/6677da88a7c70751b1bf34a8.png?v=1"
                alt="Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                AI Interview Analysis
              </h1>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                onClick={handleRetryFeedback}
                variant="outline"
                size="sm"
                disabled={retrying}
                className="text-xs sm:text-sm"
              >
                {retrying ? (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                )}
                Regenerate
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Transcript Card - Responsive height */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg">Full Interview Transcript</span>
              <Badge variant="secondary" className="text-xs">Actual Conversation</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptArr.length === 0 ? (
              <div className="text-gray-500 py-4 text-center text-sm">
                No transcript available
              </div>
            ) : (
              <div className="space-y-3 max-h-[200px] sm:max-h-[300px] overflow-y-auto">
                {transcriptArr.map((line, idx) => {
                  const isAI = line.startsWith('AI Interviewer:');
                  return (
                    <div
                      key={idx}
                      className={`rounded px-2 py-1 text-xs sm:text-sm font-mono ${
                        isAI
                          ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-400'
                          : 'bg-gray-100 text-gray-800 border-l-4 border-gray-400'
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidate Info Card - Stacked on mobile */}
        <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-6 w-6 sm:h-8 sm:w-8" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">{candidateName}</h2>
                  <p className="text-blue-100 text-xs sm:text-sm">Interview Candidate</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                {/* Position */}
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Position</p>
                    <p className="font-semibold text-sm sm:text-base">{role}</p>
                  </div>
                </div>
                
                {/* Date */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Date</p>
                    <p className="font-semibold text-sm sm:text-base">{getInterviewDate()}</p>
                  </div>
                </div>
                
                {/* Duration */}
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
                  <div>
                    <p className="text-xs sm:text-sm text-blue-200">Duration</p>
                    <p className="font-semibold text-sm sm:text-base">{formatDuration(duration)}</p>
                  </div>
                </div>
              </div>
              
              {/* Rating - Moved below on mobile */}
              <div className="mt-4 sm:mt-0 sm:text-right">
                <div className="bg-white bg-opacity-20 rounded-lg p-2 sm:p-3 inline-block">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {rating}/10
                  </div>
                  <div className="text-blue-200 text-xs sm:text-sm">{getRatingLabel(rating)}</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300" />
                    <span className="text-xs text-blue-200">AI Score</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* AI Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <span className="text-base sm:text-lg">AI Interview Analysis</span>
              <Badge variant="secondary" className="text-xs">Generated from Actual Interview</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getRatingProgress(rating)} className="mb-3" />
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{feedback.summary}</p>
          </CardContent>
        </Card>

        {/* Grid Cards - Stacked on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Key Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-700 text-base sm:text-lg">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Technical Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Technical Skills Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm sm:text-base">{feedback.technicalSkills}</p>
            </CardContent>
          </Card>

          {/* Communication Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Communication Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              {feedback.interviewInsights && (
                <p className="text-gray-700 text-sm sm:text-base mb-2">{feedback.interviewInsights}</p>
              )}
              <p className="text-gray-700 text-sm sm:text-base">{feedback.communicationSkills}</p>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          {feedback.interviewInsights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm sm:text-base">{feedback.interviewInsights}</p>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {feedback.nextSteps && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm sm:text-base">{feedback.nextSteps}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Development Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                Action Items:
              </h4>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm sm:text-base">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - Stacked on mobile */}
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          >
            Download Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
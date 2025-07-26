import Vapi from '@vapi-ai/web';
import { env } from './env';

console.log('Initializing Vapi with key:', env.VITE_VAPI_PUBLIC_KEY ? 'Present' : 'Missing');

const vapi = new Vapi(env.VITE_VAPI_PUBLIC_KEY);

export const startInterview = async (assistantId: string = env.VITE_VAPI_ASSISTANT_ID, role: string = 'Software Developer', roleDescription: string = '') => {
  try {
    console.log('Starting Vapi call with assistant ID:', assistantId, 'for role:', role);

    if (!env.VITE_VAPI_PUBLIC_KEY || !assistantId) {
      throw new Error('Missing Vapi credentials');
    }

    // Custom first message: only ask for name
    const firstMessage = `Hello, and welcome to your ${role} interview session. To begin, could you please tell me your full name?`;

    console.log('Vapi will use firstMessage:', firstMessage);

    const systemPrompt = `You are an AI interviewer conducting a job interview for a ${role} position. ${roleDescription ? `The role involves: ${roleDescription}.` : ''}

Your first set of questions should always collect the candidate's full name, their professional background, years of experience, highest education level, and any relevant certifications. Ask only one personal information question at a time, listen to the user's response, paraphrase briefly what you understood, and ask the next info question until all are answered. 

After collecting name and background, smoothly transition to technical and role-related interview questions. Only begin technical/role questions after all user background info is received.

Never repeat greetings or introductions. Stay friendly, concise, and professional. Focus your technical/role questions specifically on ${role} competencies as soon as the candidate info is gathered.

Wait for the candidate's full response to each question before asking the next.`;

    const assistantConfig = {
      model: {
        provider: "openai" as const,
        model: "gpt-4" as const,
        messages: [
          {
            role: "system" as const,
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: "11labs" as const,
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      firstMessage,
      recordingEnabled: false,
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 1800,
      backgroundSound: "off" as const,
    };

    // Set up error listener before starting to catch immediate errors
    return new Promise((resolve, reject) => {
      const errorHandler = (error: any) => {
        console.error('Vapi start error:', error);
        vapi.off('error', errorHandler);

        if (error?.error?.message?.includes('Wallet Balance is 0')) {
          reject(new Error('Insufficient Vapi credits. Please add credits to your Vapi account to use the voice interview feature.'));
        } else {
          reject(new Error(error?.error?.message || 'Failed to connect to voice service'));
        }
      };

      const callStartHandler = () => {
        console.log('Vapi call started successfully');
        vapi.off('error', errorHandler);
        vapi.off('call-start', callStartHandler);
        resolve(true);
      };

      vapi.on('error', errorHandler);
      vapi.on('call-start', callStartHandler);

      vapi.start(assistantConfig).catch(error => {
        console.error('Vapi start promise error:', error);
        vapi.off('error', errorHandler);
        vapi.off('call-start', callStartHandler);

        if (error?.error?.message?.includes('Wallet Balance is 0')) {
          reject(new Error('Insufficient Vapi credits. Please add credits to your Vapi account to use the voice interview feature.'));
        } else {
          reject(new Error(error?.error?.message || 'Failed to start voice interview'));
        }
      });
    });
  } catch (error) {
    console.error('Error starting Vapi:', error);
    throw error;
  }
};

export const stopInterview = async () => {
  try {
    console.log('Stopping Vapi call');
    await vapi.stop();
    console.log('Vapi call stopped successfully');
    return true;
  } catch (error) {
    console.error('Error stopping Vapi:', error);
    throw error;
  }
};

export { vapi };

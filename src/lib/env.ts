// Environment variables configuration
export const env = {
  VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  VITE_VAPI_PUBLIC_KEY: import.meta.env.VITE_VAPI_PUBLIC_KEY,
  VITE_VAPI_ASSISTANT_ID: import.meta.env.VITE_VAPI_ASSISTANT_ID,
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
export const validateEnv = () => {
  console.log('Environment variables loaded:', {
    geminiKey: env.VITE_GEMINI_API_KEY ? 'Present' : 'Missing',
    vapiKey: env.VITE_VAPI_PUBLIC_KEY ? 'Present' : 'Missing',
    vapiAssistant: env.VITE_VAPI_ASSISTANT_ID ? 'Present' : 'Missing',
    firebaseKey: env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing',
  });

  if (!env.VITE_GEMINI_API_KEY || !env.VITE_VAPI_PUBLIC_KEY || !env.VITE_VAPI_ASSISTANT_ID || !env.VITE_FIREBASE_API_KEY) {
    throw new Error('Missing required environment variables');
  }
  return true;
};

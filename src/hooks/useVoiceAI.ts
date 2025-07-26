import { useEffect, useRef, useState } from "react";

type UseVoiceAIResult = {
  listening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, selectedVoice?: SpeechSynthesisVoice) => void;
  resetTranscript: () => void;
};

export function useVoiceAI(): UseVoiceAIResult & { voices: SpeechSynthesisVoice[] } {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize SpeechRecognition
  if (!recognitionRef.current && typeof window !== "undefined") {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        setTranscript(event.results[0][0].transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
  }

  // Load voices on mount
  useEffect(() => {
    if ("speechSynthesis" in window) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      setTranscript("");
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const speak = (text: string, selectedVoice?: SpeechSynthesisVoice) => {
    if ("speechSynthesis" in window) {
      const synth = window.speechSynthesis;
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      synth.speak(utterance);
    }
  };

  const resetTranscript = () => setTranscript("");

  return { listening, transcript, startListening, stopListening, speak, resetTranscript, voices };
}
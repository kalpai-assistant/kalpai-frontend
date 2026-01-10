import { useState, useCallback, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { VoiceMessage } from "./types";

interface UseVoiceCallingProps {
  sendMessage: ((message: string) => void) | null;
  stopTTSForUserSpeech: () => void;
}

export const useVoiceCalling = ({
  sendMessage,
  stopTTSForUserSpeech,
}: UseVoiceCallingProps) => {
  const [isActive, setIsActive] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const sendVoiceChunk = useCallback(
    (text: string) => {
      if (sendMessage && text.trim()) {
        const message: VoiceMessage = {
          type: "text_chunk",
          content: text,
          timestamp: new Date().toISOString(),
        };
        sendMessage(JSON.stringify(message));
      }
    },
    [sendMessage],
  );

  const sendSpeechEnd = useCallback(() => {
    if (sendMessage) {
      const message: VoiceMessage = {
        type: "speech_end",
        timestamp: new Date().toISOString(),
      };
      sendMessage(JSON.stringify(message));
    }
  }, [sendMessage]);

  const resetSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (sendMessage) {
        const message: VoiceMessage = {
          type: "silence_detected",
          timestamp: new Date().toISOString(),
        };
        sendMessage(JSON.stringify(message));
        resetTranscript();
      }
    }, 2000);
  }, [clearSilenceTimer, sendMessage, resetTranscript]);

  const startVoiceCalling = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Speech recognition not supported");
      return false;
    }

    stopTTSForUserSpeech();

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
      interimResults: true,
    });

    setIsActive(true);
    return true;
  }, [browserSupportsSpeechRecognition, stopTTSForUserSpeech]);

  const stopVoiceCalling = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
      sendSpeechEnd();
    }

    setIsActive(false);
    clearSilenceTimer();
    resetTranscript();
  }, [listening, sendSpeechEnd, clearSilenceTimer, resetTranscript]);

  // Handle transcript changes
  useEffect(() => {
    if (transcript && listening) {
      stopTTSForUserSpeech();
    }
  }, [transcript, listening, stopTTSForUserSpeech]);

  // Handle final transcript
  useEffect(() => {
    if (finalTranscript && finalTranscript.trim()) {
      sendVoiceChunk(finalTranscript.trim());
      resetSilenceTimer();
    }
  }, [finalTranscript, sendVoiceChunk, resetSilenceTimer]);

  return {
    isActive,
    listening,
    browserSupportsSpeechRecognition,
    startVoiceCalling,
    stopVoiceCalling,
    clearSilenceTimer,
  };
};

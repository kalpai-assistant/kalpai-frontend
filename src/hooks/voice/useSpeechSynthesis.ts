import { useCallback, useRef } from "react";
import { pollyService } from "../../services/pollyService";

export const useSpeechSynthesis = () => {
  // Simple speech buffer like HTML version
  const speechBufferRef = useRef("");

  // Amazon Polly speakText function
  const speakText = useCallback(async (text: string) => {
    if (text.trim()) {
      try {
        await pollyService.speakComplete(text);
      } catch (error) {
        console.error("Polly TTS error:", error);
        // Fallback to browser TTS
        if ("speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          speechSynthesis.speak(utterance);
        }
      }
    }
  }, []);

  // Polly streaming speakChunk function
  const speakChunk = useCallback(
    async (text: string) => {
      // Add to Polly's internal buffer (async)
      // Polly service will handle 4-word threshold and queue management
      try {
        await pollyService.addToBuffer(text);
      } catch (error) {
        console.error("Polly buffer error:", error);
        // Fallback to old logic
        if (!speechBufferRef.current) {
          speechBufferRef.current = "";
        }
        speechBufferRef.current += text;
        if (
          speechBufferRef.current.match(/[.!?]\s*$/) ||
          speechBufferRef.current.length > 50
        ) {
          await speakText(speechBufferRef.current);
          speechBufferRef.current = "";
        }
      }
    },
    [speakText],
  );

  const speakResponse = useCallback(
    (text: string) => {
      speakText(text);
    },
    [speakText],
  );

  const stopSpeaking = useCallback(() => {
    pollyService.stop();
    speechBufferRef.current = "";
  }, []);

  const pauseSpeaking = useCallback(() => {
    pollyService.pause();
  }, []);

  const clearSpeechQueue = useCallback(() => {
    pollyService.stop();
    speechBufferRef.current = "";
  }, []);

  const flushSpeechBuffer = useCallback(async () => {
    // Flush Polly's internal buffer
    try {
      await pollyService.flushBuffer();
    } catch (error) {
      console.error("Polly flush error:", error);
    }
    // Also flush local buffer as fallback
    if (speechBufferRef.current.trim()) {
      await speakText(speechBufferRef.current);
      speechBufferRef.current = "";
    }
  }, [speakText]);

  // Stop TTS when user starts speaking (interruption)
  const stopTTSForUserSpeech = useCallback(() => {
    pollyService.stop();
    speechBufferRef.current = ""; // Clear any buffered text
  }, []);

  // Streaming functions - Polly approach
  const startStreamingSentences = useCallback(() => {
    pollyService.stop();
    speechBufferRef.current = "";
  }, []);

  const addStreamingText = useCallback(
    (chunk: string) => {
      speakChunk(chunk);
    },
    [speakChunk],
  );

  const finishStreamingSentences = useCallback(async () => {
    await flushSpeechBuffer();
  }, [flushSpeechBuffer]);

  // Handle voice_response_end message
  const handleVoiceResponseEnd = useCallback(async () => {
    try {
      await pollyService.handleVoiceResponseEnd();
    } catch (error) {
      console.error("Voice response end error:", error);
    }
  }, []);

  return {
    speakChunk,
    speakResponse,
    speakText,
    stopSpeaking,
    pauseSpeaking,
    clearSpeechQueue,
    flushSpeechBuffer,
    stopTTSForUserSpeech, // New function for user interruption
    speechStatus: "ended", // Not really tracked but keeping for compatibility
    isInQueue: pollyService.getState().isPlaying,
    queueLength: pollyService.getState().queueLength,

    // Streaming functions
    startStreamingSentences,
    addStreamingText,
    finishStreamingSentences,
    handleVoiceResponseEnd,
  };
};

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import useWebSocket from "../../api/websocketHandler/WSHook";
import { useVoiceCalling } from "./useVoiceCalling";
import { ServerMessage, VoiceMessage } from "./types";

interface UseCallControllerArgs {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string;
}

interface UseCallControllerReturn {
  browserSupportsSpeechRecognition: boolean;
  statusText: string;
  formattedDuration: string;
  isMuted: boolean;
  isMobile: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
}

export function useCallController({
  isOpen,
  onClose,
  sessionToken,
}: UseCallControllerArgs): UseCallControllerReturn {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [silenceWarning, setSilenceWarning] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState(10);
  const lastActivityRef = useRef<number>(Date.now());

  // Voice calling integration
  const {
    speakChunk,
    speakResponse,
    stopSpeaking,
    clearSpeechQueue,
    flushSpeechBuffer,
    stopTTSForUserSpeech,
  } = useSpeechSynthesis();

  // WebSocket message handler
  const messageHandlerRef = useRef<(data: string) => void>(() => {});

  const handleWebSocketMessage = useCallback((data: string) => {
    messageHandlerRef.current(data);
  }, []);

  // Initialize WebSocket with voice endpoint only when modal is open
  const { sendMessage, disconnectWS } = useWebSocket(
    isOpen ? `voice/${sessionToken}` : "",
    handleWebSocketMessage,
    false,
  );

  // Voice calling hook
  const {
    isActive: isVoiceActive,
    listening,
    browserSupportsSpeechRecognition,
    startVoiceCalling,
    stopVoiceCalling,
    clearSilenceTimer,
  } = useVoiceCalling({
    sendMessage,
    stopTTSForUserSpeech,
  });

  // Handle server messages for voice responses (simplified for calling)
  const handleServerMessage = useCallback(
    (data: ServerMessage) => {
      // Update activity timestamp for any server message
      lastActivityRef.current = Date.now();

      switch (data.type) {
        case "voice_response_chunk":
          if (data.content) {
            speakChunk(data.content);
          }
          break;
        case "voice_response_end":
          flushSpeechBuffer();
          break;
        case "voice_response":
          if (data.content) {
            speakResponse(data.content);
          }
          break;
        case "error":
          // eslint-disable-next-line no-console
          console.error("Voice call error:", data.message);
          break;
      }
    },
    [speakChunk, speakResponse, flushSpeechBuffer],
  );

  // Update message handler
  useEffect(() => {
    messageHandlerRef.current = (data: string) => {
      try {
        const message = JSON.parse(data);
        handleServerMessage(message);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse voice message:", e);
      }
    };
  }, [handleServerMessage]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ),
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Play short beep for silence warning
  const playWarningBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.2,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Could not play warning beep:", error);
    }
  }, []);

  // Send call ended message
  const sendCallEndedMessage = useCallback(() => {
    if (sendMessage) {
      const message: VoiceMessage = {
        type: "call_ended",
        timestamp: new Date().toISOString(),
      };
      sendMessage(JSON.stringify(message));
    }
  }, [sendMessage]);

  // Play realistic "tring-tring" ring (dual-tone bursts)
  const playRingingSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Two oscillators mixed together for classic ring tone
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = 440; // A4
      osc2.frequency.value = 480; // Close to B4 flat

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const startTime = audioContext.currentTime;

      // Two bursts: 0.0-0.4s and 0.6-1.0s
      const scheduleBurst = (
        offsetSeconds: number,
        durationSeconds: number,
      ) => {
        const attack = 0.01;
        const release = 0.05;
        gainNode.gain.setValueAtTime(0, startTime + offsetSeconds);
        gainNode.gain.linearRampToValueAtTime(
          0.2,
          startTime + offsetSeconds + attack,
        );
        gainNode.gain.linearRampToValueAtTime(
          0.2,
          startTime +
            offsetSeconds +
            Math.max(durationSeconds - release, attack),
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          startTime + offsetSeconds + durationSeconds,
        );
      };

      scheduleBurst(0.0, 0.4);
      scheduleBurst(0.6, 0.4);

      osc1.start(startTime);
      osc2.start(startTime);
      const stopAt = startTime + 1.2;
      osc1.stop(stopAt);
      osc2.stop(stopAt);

      // Close audio context shortly after to free resources
      window.setTimeout(() => {
        try {
          audioContext.close();
        } catch {
          /* noop */
        }
      }, 1400);

      // Return null; oscillators self-stop on schedule
      return null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log("Could not play ringing sound:", error);
      return null;
    }
  }, []);

  // Simulate connection delay with ringing sound
  useEffect(() => {
    let connectingTimer: NodeJS.Timeout;

    if (isOpen) {
      setIsConnecting(true);
      playRingingSound();

      connectingTimer = setTimeout(() => {
        setIsConnecting(false);
      }, 2000);
    } else {
      setIsConnecting(false);
    }

    return () => {
      clearTimeout(connectingTimer);
    };
  }, [isOpen, playRingingSound]);

  // Silence detection and countdown logic
  useEffect(() => {
    let silenceTimer: NodeJS.Timeout;

    if (isOpen && !isConnecting && isVoiceActive && !silenceWarning) {
      silenceTimer = setTimeout(() => {
        const now = Date.now();
        const timeSinceLastActivity = now - lastActivityRef.current;

        if (timeSinceLastActivity >= 20000) {
          // 20 seconds of silence
          setSilenceWarning(true);
          playWarningBeep();
          setDisconnectCountdown(10);
        }
      }, 21000); // Check slightly after 20 seconds
    }

    return () => {
      clearTimeout(silenceTimer);
    };
  }, [isOpen, isConnecting, isVoiceActive, silenceWarning, playWarningBeep]);

  const handleEndCall = useCallback(() => {
    // Send call ended message before disconnecting
    sendCallEndedMessage();

    // Stop voice calling and cleanup
    stopVoiceCalling();
    stopSpeaking();
    clearSpeechQueue();
    clearSilenceTimer();
    if (disconnectWS) {
      disconnectWS();
    }

    setCallDuration(0);
    setIsMuted(false);
    setIsSpeakerOn(false);
    setSilenceWarning(false);
    setDisconnectCountdown(10);
    onClose();
  }, [
    sendCallEndedMessage,
    stopVoiceCalling,
    stopSpeaking,
    clearSpeechQueue,
    clearSilenceTimer,
    disconnectWS,
    onClose,
  ]);

  // Countdown timer when silence warning is active
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (silenceWarning && disconnectCountdown > 0) {
      countdownInterval = setInterval(() => {
        setDisconnectCountdown((prev) => {
          if (prev <= 1) {
            // Auto-disconnect when countdown reaches 0
            sendCallEndedMessage();
            handleEndCall();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [
    silenceWarning,
    disconnectCountdown,
    sendCallEndedMessage,
    handleEndCall,
  ]);

  // Reset silence warning on activity
  useEffect(() => {
    if (listening) {
      lastActivityRef.current = Date.now();
      if (silenceWarning) {
        setSilenceWarning(false);
        setDisconnectCountdown(10);
      }
    }
  }, [listening, silenceWarning]);

  // Call duration timer and voice chat initialization
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      // Auto-start voice calling when call opens (unless muted) and after connection simulation
      if (
        !isMuted &&
        browserSupportsSpeechRecognition &&
        !isVoiceActive &&
        sendMessage &&
        !isConnecting
      ) {
        startVoiceCalling();
      }
    } else {
      setCallDuration(0);
      // Cleanup when call closes
      if (isVoiceActive) {
        stopVoiceCalling();
      }
      // Reset states
      setIsMuted(false);
      setIsSpeakerOn(false);
    }
    return () => clearInterval(interval);
  }, [
    isOpen,
    isMuted,
    browserSupportsSpeechRecognition,
    isVoiceActive,
    startVoiceCalling,
    stopVoiceCalling,
    sendMessage,
    isConnecting,
  ]);

  // Format call duration
  const formattedDuration = useMemo(() => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, [callDuration]);

  const onToggleMute = useCallback(() => {
    // Update activity on any user interaction
    lastActivityRef.current = Date.now();
    if (silenceWarning) {
      setSilenceWarning(false);
      setDisconnectCountdown(10);
    }

    if (isMuted) {
      // Unmuting - start voice calling if not active
      if (!isVoiceActive && browserSupportsSpeechRecognition && sendMessage) {
        startVoiceCalling();
      }
    } else {
      // Muting - stop voice calling
      if (isVoiceActive) {
        stopVoiceCalling();
      }
    }
    setIsMuted((prev) => !prev);
  }, [
    silenceWarning,
    isMuted,
    isVoiceActive,
    browserSupportsSpeechRecognition,
    sendMessage,
    startVoiceCalling,
    stopVoiceCalling,
  ]);

  const onToggleSpeaker = useCallback(() => {
    if (isMobile) {
      setIsSpeakerOn((prev) => !prev);
    }
  }, [isMobile]);

  const statusText = useMemo(() => {
    if (silenceWarning) {
      return `Are you still there? (disconnecting in ${disconnectCountdown} seconds)`;
    }
    if (isConnecting) return "Connecting...";
    if (listening) return "Listening...";
    if (isVoiceActive) return "Voice Ready";
    if (sendMessage) return "Connected";
    return "Connecting...";
  }, [
    silenceWarning,
    disconnectCountdown,
    isConnecting,
    listening,
    isVoiceActive,
    sendMessage,
  ]);

  return {
    browserSupportsSpeechRecognition,
    statusText,
    formattedDuration,
    isMuted,
    isMobile,
    isSpeakerOn,
    onToggleMute,
    onToggleSpeaker,
    onEndCall: handleEndCall,
  };
}

export default useCallController;

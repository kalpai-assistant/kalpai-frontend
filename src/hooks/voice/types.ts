export interface VoiceChatMessage {
  id: string;
  content: string;
  type: "user" | "assistant" | "system" | "error";
  timestamp: string;
  isStreaming?: boolean;
}

export interface VoiceChatProps {
  sessionToken?: string;
  onClose?: () => void;
}

export interface ServerMessage {
  type: string;
  content?: string;
  message?: string;
  role?: string;
  data?: any;
}

export interface VoiceMessage {
  type: "text_chunk" | "speech_end" | "live_transcript" | "silence_detected" | "call_ended";
  content?: string;
  timestamp: string;
}
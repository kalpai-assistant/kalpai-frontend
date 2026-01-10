// Voice Analytics request/response models

export interface VoiceCallAnalyticsData {
  id: number;
  chat_session_id: number;
  started_at: string; // ISO datetime string
  ended_at?: string | null; // ISO datetime string or null
  total_messages_count: number;
  duration_minutes?: string | null;
}

export interface VoiceAnalyticsSummary {
  total_calls: number;
  total_duration_minutes: string;
  average_call_duration_minutes: string;
  total_messages: number;
  average_messages_per_call: number;
  active_calls: number;
}

export interface VoiceAnalyticsRequestParams {
  start_date?: string; // ISO datetime string
  end_date?: string; // ISO datetime string
  chat_session_id?: number;
  limit?: number;
  offset?: number;
}

export interface VoiceAnalyticsListResponse {
  calls: VoiceCallAnalyticsData[];
  summary: VoiceAnalyticsSummary;
  total_count: number;
}

export interface VoiceAnalyticsDetailResponse {
  call: VoiceCallAnalyticsData;
}

export const VoiceAnalyticsQueryNames = {
  VOICE_ANALYTICS_LIST: "VOICE-ANALYTICS-LIST",
  VOICE_ANALYTICS_SUMMARY: "VOICE-ANALYTICS-SUMMARY",
  VOICE_ANALYTICS_DETAIL: "VOICE-ANALYTICS-DETAIL",
};

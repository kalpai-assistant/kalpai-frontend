import { AxiosResponse } from "axios";
import { apiClient } from "./apiHelper";
import {
  VoiceAnalyticsDetailResponse,
  VoiceAnalyticsListResponse,
  VoiceAnalyticsRequestParams,
  VoiceAnalyticsSummary,
} from "./requests_responses/voiceAnalytics";

// Base path for voice analytics
const BASE = "/voice-analytics";

export const getVoiceAnalytics = async (
  params: VoiceAnalyticsRequestParams = {},
): Promise<AxiosResponse<VoiceAnalyticsListResponse>> => {
  return apiClient.get<VoiceAnalyticsListResponse>(`${BASE}/`, { params });
};

export const getVoiceAnalyticsSummary = async (
  params: Omit<
    VoiceAnalyticsRequestParams,
    "limit" | "offset" | "chat_session_id"
  > = {},
): Promise<AxiosResponse<VoiceAnalyticsSummary>> => {
  return apiClient.get<VoiceAnalyticsSummary>(`${BASE}/summary`, { params });
};

export const getVoiceAnalyticsDetail = async (
  analyticsId: number,
): Promise<AxiosResponse<VoiceAnalyticsDetailResponse>> => {
  return apiClient.get<VoiceAnalyticsDetailResponse>(`${BASE}/${analyticsId}`);
};

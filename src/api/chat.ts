import { AxiosResponse } from "axios";
import {
  ChatHeadRequest,
  ChatHeadResponse,
  ChatSessionResponse,
  CreateChatRequest,
} from "./requests_responses/chat";
import { GenerateTokenResponse } from "./requests_responses/business";
import { apiClient } from "./apiHelper";

// Create Chat Session
export const createChatSession = async (
  request: CreateChatRequest,
): Promise<AxiosResponse<GenerateTokenResponse>> => {
  return apiClient.post<GenerateTokenResponse>("/chat/session", request);
};

// Get Chat Head Details
export const getChatHeadDetails = async (
  params: ChatHeadRequest,
): Promise<AxiosResponse<ChatHeadResponse>> => {
  return apiClient.get<ChatHeadResponse>("/chat/business-chat-details", params);
};

export const getBusinessChats = async (
  searchString: string,
  page: number,
  size: number,
  chatSessionId?: string | null,
  sourceType?: string,
): Promise<AxiosResponse<ChatSessionResponse>> => {
  const params: any = {
    search_query: searchString,
    chat_id: chatSessionId,
    page,
    size,
  };

  if (sourceType) {
    params.source_type = sourceType;
  }

  return apiClient.get<ChatSessionResponse>(`/chat/`, params);
};

import { AxiosResponse } from "axios";
import { apiClient } from "./apiHelper";
import { StandardResponse } from "./requests_responses/business";
import {
  ChatIntroImageResponse,
  ChatIntroLineRequest,
  ChatIntroLineResponse,
} from "./requests_responses/intro";

export const getChatIntroLines = async (): Promise<
  AxiosResponse<ChatIntroLineResponse[]>
> => {
  return apiClient.get<ChatIntroLineResponse[]>("/business/intro/line");
};

export const addChatIntroLine = async (
  request: ChatIntroLineRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.post<StandardResponse>("/business/intro/line", request);
};

export const deleteChatIntroLine = async (
  introLineId: number,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.delete<StandardResponse>(
    `/business/intro/line/${introLineId}`,
  );
};

export const selectChatIntroLine = async (
  introLineId: number,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.post<StandardResponse>(
    `/business/intro/line/${introLineId}`,
  );
};

export const updateChatntroLine = async (
  request: ChatIntroLineRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>("/business/intro/line", request);
};

export const getChatIntroImages = async (): Promise<
  AxiosResponse<ChatIntroImageResponse[]>
> => {
  return apiClient.get<ChatIntroImageResponse[]>("/business/intro/image");
};

export const addChatIntroImage = async (
  formData: FormData,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.postForFiles<StandardResponse>(
    "/business/intro/image",
    formData,
  );
};

export const deleteChatIntroImage = async (
  imageId: number,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.delete<StandardResponse>(`/business/intro/image/${imageId}`);
};

export const updateChatIntroImageDescription = async (
  imageId: number,
  description: string,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>(`/business/intro/image/${imageId}`, {
    description,
  });
};

export const updateChatIntroImage = async (
  request: ChatIntroLineRequest,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>("/business/intro/image", request);
};

export const IntroQueryNames = {
  GET_CHAT_INTRO_LINES: "GET-CHAT-INTRO-LINES",
  GET_CHAT_INTRO_IMAGES: "GET-CHAT-INTRO-IMAGES",
};

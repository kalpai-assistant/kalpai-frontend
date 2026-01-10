import { AxiosResponse } from "axios";
import { apiClient } from "./apiHelper";
import {
  TelegramBotConfig,
  TelegramBotConfigRequest,
  TelegramBotConfigResponse,
  TelegramAnalytics,
} from "./requests_responses/telegram";

export const getTelegramBotConfig = async (): Promise<
  AxiosResponse<TelegramBotConfig>
> => {
  return apiClient.get<TelegramBotConfig>("/telegram/bot-config");
};

export const createTelegramBotConfig = async (
  data: TelegramBotConfigRequest,
): Promise<AxiosResponse<TelegramBotConfigResponse>> => {
  return apiClient.post<TelegramBotConfigResponse>(
    "/telegram/bot-config",
    data,
  );
};

export const deleteTelegramBotConfig = async (): Promise<
  AxiosResponse<TelegramBotConfigResponse>
> => {
  return apiClient.delete<TelegramBotConfigResponse>("/telegram/bot-config");
};

// Dummy analytics endpoint for now
export const getTelegramAnalytics = async (): Promise<
  AxiosResponse<TelegramAnalytics>
> => {
  return Promise.resolve({
    data: {
      total_messages: 0,
      unique_users: 0,
      active_conversations: 0,
      response_rate: 0,
    },
  } as AxiosResponse<TelegramAnalytics>);
};

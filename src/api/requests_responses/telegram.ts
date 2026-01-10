// Telegram API Request/Response Types

export interface TelegramBotConfig {
  id: number;
  business_id: number;
  bot_username: string;
  is_active: boolean;
  created_time: string;
  updated_time: string;
  webhook_url: string;
}

export interface TelegramBotConfigRequest {
  bot_token: string;
}

export interface TelegramBotConfigResponse {
  ok: boolean;
}

export interface TelegramAnalytics {
  total_messages: number;
  unique_users: number;
  active_conversations: number;
  response_rate: number;
}

export const TelegramQueryNames = {
  GET_BOT_CONFIG: "TELEGRAM-GET-BOT-CONFIG",
  CREATE_BOT_CONFIG: "TELEGRAM-CREATE-BOT-CONFIG",
  DELETE_BOT_CONFIG: "TELEGRAM-DELETE-BOT-CONFIG",
  GET_ANALYTICS: "TELEGRAM-GET-ANALYTICS",
};

export interface Coordinates {
  latitude?: number;
  longitude?: number;
}

export interface CreateChatRequest {
  business_id: number;
  location_coordinates?: Coordinates;
  client_ip?: string;
  tuid?: string;
}

export interface ChatSessionPageResponse {
  session_id: string;
  created_time: string;
  browser: string;
  browser_version: string;
  device: string;
  device_type: string;
  os: string;
  ip: string;
  coordinates: string;
  location: string;
  source: string;
}

export interface ChatSessionResponse {
  items: ChatSessionPageResponse[];
  page: number;
  total: number;
  size: number;
  pages: number;
}

export interface ChatHeadRequest {
  session_token?: string;
  business_id?: number;
}

export interface ChatHeadResponse {
  chat_head_url: string;
  chat_head_name: string;
}

export const ChatQueryNames = {
  GET_CHAT_LIST: "GET_CHAT_LIST",
  GET_CHAT_HEAD_DETAILS: "GET-CHAT-HEAD-DETAILS",
};

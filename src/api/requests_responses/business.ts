// Define the types for the props

// Requests
export interface BusinessOnboardRequest {
  email: string;
  name: string;
  business_type: string;
  description: string;
}

export interface RegenerateBusinessRequest {
  description: string;
  business_id?: number;
  atLogin: boolean;
}

export interface BusinessUpdateRequest {
  business_id: number;
  context: Record<string, any>;
  context_type?: string; // Optional, as it defaults to ContextTypes.DEFAULT
}

export interface BusinessUpdateNameTypeRequest {
  name?: string;
  business_type?: string;
  email?: string;
}

export interface VerifyOTPRequest {
  token: string;
  otp: string;
}

// Responses
export interface BusinessOnboardResponse {
  business_id: number;
  business_data: Record<string, any>;
}

export interface GenerateTokenResponse {
  token: string;
  is_admin: boolean;
}

export interface StandardResponse {
  ok: boolean;
}

export interface UserBusinessDetailsResponse {
  business_id: number;
  data: Record<string, any>;
  name: string;
  business_type: string;
  email: string;
  created_time: string;
  description: string;
  business_docs: BusinessDocumentResponse[];
  context_processing_semaphore: number;
}

export interface UserBusinessResponse {
  name: string;
  email: string;
  created_time: string;
  status: string;
  chat_head_url: string;
  chat_head_name: string;
}

export interface BusinessResponse {
  id: number;
  name: string;
  business_type: string;
  email: string;
  created_time: string;
}

export interface BusinessListResponse {
  items: BusinessResponse[];
  page: number;
  total: number;
  size: number;
  pages: number;
}

export interface BusinessOverviewStats {
  total_interactions: number;
  unique_interactions: number;
  unique_locations: number;
  total_messages: number;
}

export interface BusinessChatLinkPath {
  chat_link_path: string;
}

export interface BusinessChatIntegrationScript {
  script: string;
}

// Business Document types
export interface BusinessDocumentResponse {
  id: number;
  file_s3_url: string;
  created_time: string;
}

export const BusinessQueryNames = {
  ADMIN_GET_BUSINESS_LIST: "ADMIN-GET-BUSINESS-LIST",
  GET_USER_BUSINESS_DETAILS: "GET-USER-BUSINESS-DETAILS",
  GET_USER_BUSINESS: "GET-USER-BUSINESS",
  GET_QUICK_STATS: "GET-QUICK-STATS",
  CHAT_LINK_PATH: "CHAT-LINK-PATH",
  CHAT_INTEGRATION_SCRIPT: "CHAT-INTEGRATION-SCRIPT",
  UPDATE_CHAT_HEAD: "UPDATE-CHAT-HEAD",
  UPDATE_CHAT_HEAD_PIC: "UPDATE-CHAT-HEAD-PIC",
  PROCESS_BUSINESS_DOCS: "PROCESS-BUSINESS-DOCS",
};

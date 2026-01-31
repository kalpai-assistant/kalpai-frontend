// WhatsApp Outreach API Request/Response Types

// Enums
export enum TemplateStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum TemplateCategory {
  MARKETING = "MARKETING",
  UTILITY = "UTILITY",
  AUTHENTICATION = "AUTHENTICATION",
}

export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
}

// ... existing code ...

export interface WhatsAppCampaign {
  id: number;
  name: string;
  status: CampaignStatus;
  template_id: number;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  pending_count: number;
  scheduled_at?: string | null;
  started_at?: string;
  completed_at?: string;
  daily_sending_limit?: number;
  sending_schedule?: SendingSchedule;
  auto_reply_theme?: string;
  auto_reply_prompt?: string;
  team_assignment_enabled?: boolean;
  created_time: string;
  updated_time: string;
}

export enum MessageTier {
  TIER_1K = "TIER_1K",
  TIER_10K = "TIER_10K",
  TIER_100K = "TIER_100K",
  TIER_UNLIMITED = "TIER_UNLIMITED",
}

export enum QualityRating {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED",
}

export enum AccountStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

// Account Types
export interface WhatsAppAccount {
  id: number;
  business_id: number;
  phone_number: string;
  display_name: string;
  quality_rating: QualityRating;
  messaging_tier: MessageTier;
  is_verified: boolean;
  status: AccountStatus | string;
  provider?: string; // 'twilio' or 'meta'
  created_time: string;
  updated_time: string;
}

export interface WhatsAppAccountsResponse {
  accounts: WhatsAppAccount[];
}

export interface DisconnectAccountResponse {
  ok: boolean;
}

export interface RequestAccountRequest {
  business_name: string;
  request_details: string;
}

export interface RequestAccountResponse {
  id: number;
  status: AccountStatus;
  created_time: string;
}

export interface EnableWhatsAppResponse {
  id: number;
  phone_number: string;
  status: AccountStatus;
}

export interface SetupProfileRequest {
  name: string;
  description?: string;
  category: string;
  website?: string;
}

export interface SetupProfileResponse {
  success: boolean;
  business_profile_id: string;
}

// Template Types
export interface TemplateButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppTemplate {
  id: number;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  body: string;
  language: string;
  footer?: string;
  buttons?: TemplateButton[];
  created_time: string;
  updated_time?: string;
}

export interface CreateTemplateRequest {
  name: string;
  category: TemplateCategory;
  body: string;
  language: string;
  footer?: string;
  header?: string | null;
  buttons?: TemplateButton[] | null;
}

export interface CreateTemplateResponse {
  id: number;
  name: string;
  status: TemplateStatus;
  category: TemplateCategory;
  body: string;
  created_time: string;
}

export interface TemplatesResponse {
  templates: WhatsAppTemplate[];
}

// Campaign Types
export interface CampaignRecipient {
  phone_number: string;
  template_params: {
    [key: string]: string;
  };
}

export interface SendingWindow {
  days: string[];
  start_time: string;
  end_time: string;
}

export interface SendingSchedule {
  enabled: boolean;
  timezone: string;
  windows: SendingWindow[];
}

export interface WhatsAppCampaign {
  id: number;
  name: string;
  status: CampaignStatus;
  template_id: number;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  pending_count: number;
  started_at?: string;
  completed_at?: string;
  daily_sending_limit?: number;
  sending_schedule?: SendingSchedule;
  auto_reply_theme?: string;
  auto_reply_prompt?: string;
  team_assignment_enabled?: boolean;
  created_time: string;
  updated_time: string;
}

export interface CreateCampaignRequest {
  name: string;
  template_id: number;
  scheduled_at?: string | null;
  daily_sending_limit?: number;
  sending_schedule?: SendingSchedule;
  auto_reply_theme?: string;
  auto_reply_prompt?: string;
  team_assignment_enabled?: boolean;
}

export interface CreateCampaignResponse {
  id: number;
  business_id: number;
  whatsapp_account_id: number;
  template_id: number;
  name: string;
  status: CampaignStatus;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_time: string;
  updated_time: string;
}

export interface AddRecipientsRequest {
  recipients: CampaignRecipient[];
}

export interface AddRecipientsResponse {
  added: number;
  total: number;
}

export interface CampaignsResponse {
  campaigns: WhatsAppCampaign[];
}

export interface CampaignStatsResponse {
  campaign_id: number;
  campaign_name: string;
  status: CampaignStatus;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  pending_count: number;
  delivery_rate: number;
  read_rate: number;
}

export interface CampaignQuotaResponse {
  campaign_id: number;
  campaign_name: string;
  daily_limit: number;
  sent_today: number;
  remaining: number;
  last_reset_date: string;
  can_send_more: boolean;
}

export interface StartCampaignResponse {
  success: boolean;
  status: CampaignStatus;
}

export interface PauseCampaignResponse {
  success: boolean;
  status: CampaignStatus;
}

// AI Chat Types
export interface ChatSession {
  session_id: number;
  source: string;
  external_session_id: string;
  customer_phone: string;
  last_message: string;
  created_time: string;
  updated_time: string;
}

export interface ChatMessage {
  message_id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  time: string;
}

export interface ChatSessionsResponse {
  data: ChatSession[];
}

export interface ChatMessagesResponse {
  data: ChatMessage[];
}

// Query Names for React Query
export const WhatsAppQueryNames = {
  // Accounts
  GET_WHATSAPP_ACCOUNTS: "WHATSAPP-GET-ACCOUNTS",

  // Templates
  GET_TEMPLATES: "WHATSAPP-GET-TEMPLATES",

  // Campaigns
  GET_CAMPAIGNS: "WHATSAPP-GET-CAMPAIGNS",
  GET_CAMPAIGN: "WHATSAPP-GET-CAMPAIGN",
  GET_CAMPAIGN_STATS: "WHATSAPP-GET-CAMPAIGN-STATS",
  GET_CAMPAIGN_QUOTA: "WHATSAPP-GET-CAMPAIGN-QUOTA",

  // AI Chat
  GET_CHAT_SESSIONS: "WHATSAPP-GET-CHAT-SESSIONS",
  GET_CHAT_MESSAGES: "WHATSAPP-GET-CHAT-MESSAGES",
};

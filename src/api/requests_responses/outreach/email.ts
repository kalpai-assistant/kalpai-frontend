// Email Outreach API Request/Response Types

// Enums
export enum CampaignStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum EmailStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  BOUNCED = "bounced",
  SKIPPED = "skipped",
}

export enum Sentiment {
  INTERESTED = "interested",
  NOT_INTERESTED = "not_interested",
  NEUTRAL = "neutral",
}

export enum AIFlavor {
  PROFESSIONAL = "professional",
  CASUAL = "casual",
  FRIENDLY = "friendly",
}

// Gmail Account Types
export interface GmailAccount {
  id: number;
  gmail_address: string;
  is_connected: boolean;
  daily_send_limit: number;
  daily_sent_count: number;
  last_reset_date: string;
}

export interface GmailAuthUrlResponse {
  ok: boolean;
  auth_url: string;
}

export interface GmailCallbackRequest {
  code: string;
  state?: string;
}

export interface GmailCallbackResponse {
  ok: boolean;
  id: number;
  gmail_address: string;
  is_connected: boolean;
  daily_send_limit: number;
  daily_sent_count: number;
  last_reset_date: string;
}

export interface GmailAccountsResponse {
  ok: boolean;
  accounts: GmailAccount[];
}

export type GmailAccountStatus =
  | "healthy"
  | "expired"
  | "disconnected"
  | "needs_reconnect";

export interface GmailAccountStatusResponse {
  ok: boolean;
  status: GmailAccountStatus;
  gmail_address: string;
  token_expiry: string | null; // ISO datetime
  can_refresh: boolean;
  message: string;
}

export interface GmailAccountRefreshResponse {
  ok: boolean;
  refreshed: boolean;
  auth_url: string | null; // Only present if refreshed=false
  message: string;
}

// Gmail Account Stats (Multi-Sender)
export type AccountType = "free" | "workspace";

export interface GmailAccountStats {
  ok: boolean;
  id: number;
  gmail_address: string;
  max_daily_limit: number; // Account's absolute max
  daily_sent_count: number; // Current sent (cached, real-time)
  available: number; // max_daily_limit - daily_sent_count
  last_synced_at: string; // ISO datetime
  account_type: AccountType;
  is_connected: boolean;
  total_campaigns_using?: number; // Optional: how many campaigns use this account
  total_daily_limits_sum?: number; // Optional: sum of daily limits across all campaigns
}

export interface UpdateGmailLimitsRequest {
  max_daily_limit: number;
}

export interface UpdateGmailLimitsResponse {
  ok: boolean;
  id: number;
  gmail_address: string;
  is_connected: boolean;
  daily_send_limit: number;
  daily_sent_count: number;
  last_reset_date: string;
}

// Campaign Gmail Accounts (Multi-Sender)
export interface CampaignGmailAccount {
  id: number; // Mapping ID
  campaign_id: number;
  gmail_account_id: number;
  gmail_address: string;
  daily_limit: number; // Per-campaign limit for THIS account
  priority: number; // Distribution priority (1 = highest)
  is_active: boolean;
  current_sent: number; // Today's sent count (real-time)
  available: number; // daily_limit - current_sent
}

export interface AddCampaignGmailAccountRequest {
  gmail_account_id: number;
  daily_limit: number;
  priority: number;
}

export interface AddCampaignGmailAccountResponse {
  ok: boolean;
  id: number;
  campaign_id: number;
  gmail_account_id: number;
  gmail_address: string;
  daily_limit: number;
  priority: number;
  is_active: boolean;
  current_sent: number;
  available: number;
}

export interface UpdateCampaignGmailAccountRequest {
  daily_limit?: number;
  priority?: number;
  is_active?: boolean;
}

export interface UpdateCampaignGmailAccountResponse {
  ok: boolean;
  id: number;
  campaign_id: number;
  gmail_account_id: number;
  gmail_address: string;
  daily_limit: number;
  priority: number;
  is_active: boolean;
  current_sent: number;
  available: number;
}

// Team Member Types
export interface TeamMember {
  id: number;
  email: string;
  name?: string;
  role?: string;
  is_active: boolean;
  created_time: string;
}

export interface TeamMemberRequest {
  email: string;
  name?: string;
  role?: string;
  description?: string;
}

export interface TeamMemberResponse {
  ok: boolean;
  id: number;
  email: string;
  name?: string;
  role?: string;
  is_active: boolean;
  created_time: string;
}

export interface TeamMembersResponse {
  ok: boolean;
  team_members: TeamMember[];
}

// Email List Types
export interface EmailList {
  id: number;
  name: string;
  description?: string;
  total_contacts: number;
  created_time: string;
  updated_time: string;
}

export interface EmailListRequest {
  name: string;
  description?: string;
  file?: File;
}

export interface EmailListResponse {
  ok: boolean;
  id: number;
  name: string;
  description?: string;
  total_contacts: number;
  created_time: string;
  updated_time: string;
}

export interface EmailListsResponse {
  ok: boolean;
  email_lists: EmailList[];
}

// Contact Types
export interface Contact {
  id: number;
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
  is_unsubscribed: boolean;
}

export interface ContactsResponse {
  ok: boolean;
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

// Campaign Email Types (Multi-List Support)
export interface CampaignEmail {
  id: number;
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
  custom_fields?: Record<string, any>;
  status: EmailStatus;
  sent_at?: string;
  failed_at?: string;
  failure_reason?: string;
  gmail_account_id?: number;
  sent_email_id?: number;
  created_time: string;
  updated_time: string;
}

export interface CampaignEmailsResponse {
  ok: boolean;
  emails: CampaignEmail[];
  total: number;
  page: number;
  limit: number;
}

export interface AddCampaignEmailsRequest {
  source: "list" | "manual";
  email_list_id?: number; // Required if source = "list"
  emails?: Array<{
    email: string;
    name?: string;
    company_name?: string;
    location?: string;
    phone_number?: string;
    custom_fields?: Record<string, any>;
  }>; // Required if source = "manual"
}

export interface AddCampaignEmailsResponse {
  ok: boolean;
  added: number;
  duplicates: number;
  total_recipients: number;
}

export interface UpdateCampaignEmailRequest {
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
  custom_fields?: Record<string, any>;
}

export interface BulkDeleteCampaignEmailsRequest {
  email_ids: number[];
}

export interface BulkDeleteCampaignEmailsResponse {
  ok: boolean;
  deleted: number;
  total_recipients: number;
}

// Email List Association (for campaign display)
export interface EmailListAssociation {
  id: number;
  name: string;
  description?: string | null;
  total_contacts: number;
  created_time: string;
  updated_time: string;
}

// Campaign Types
export interface Campaign {
  id: number;
  name: string;
  status: CampaignStatus;
  subject_line: string;
  email_template?: string;
  ai_flavor?: AIFlavor;
  total_recipients: number;
  emails_sent: number;
  emails_failed: number;
  emails_bounced: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_time: string;
  gmail_account_id?: number; // Backward compatibility
  email_list_id?: number;
  sending_schedule?: SendingSchedule;
  gmail_accounts?: CampaignGmailAccount[]; // Multi-sender support
  team_assignment_enabled?: boolean; // NEW: Team assignment feature
  auto_reply_enabled?: boolean; // Track auto-reply status
  email_list_associations?: EmailListAssociation[]; // NEW: Associated email lists
}

export interface CampaignRequest {
  name: string;
  gmail_account_id: number;
  email_list_id?: number; // Now optional (deprecated)
  email_list_ids?: number[]; // NEW: Multiple lists
  emails?: Array<{
    // NEW: Manual emails
    email: string;
    name?: string;
    company_name?: string;
    location?: string;
    phone_number?: string;
    custom_fields?: Record<string, any>;
  }>;
  subject_line: string;
  email_template?: string;
  ai_flavor?: AIFlavor;
  scheduled_at?: string;
}

export interface CampaignResponse {
  ok: boolean;
  id: number;
  name: string;
  status: CampaignStatus;
  subject_line: string;
  email_template?: string;
  ai_flavor?: AIFlavor;
  total_recipients: number;
  emails_sent: number;
  emails_failed: number;
  emails_bounced: number;
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_time: string;
  file_mappings?: CampaignFile[];
  sending_schedule?: SendingSchedule;
  team_assignment_enabled?: boolean;
  auto_reply_enabled?: boolean;
}

export interface CampaignsResponse {
  ok: boolean;
  campaigns: Campaign[];
}

export interface CampaignUpdateRequest {
  name?: string;
  subject_line?: string;
  email_template?: string;
  ai_flavor?: AIFlavor;
  scheduled_at?: string;
}

// Campaign Content Update (supports switching between template and automation)
export interface CampaignContentUpdateRequest {
  subject_line?: string;
  email_template?: string;
  ai_flavor?: AIFlavor;
  // For file mappings when updating with existing files
  file_mappings?: Record<string, number | string>;
}

export interface CampaignContentUpdateResponse {
  ok: boolean;
  message: string;
}

// Campaign File Types
export interface CampaignFile {
  placeholder_key: string;
  file_id: number;
  s3_url: string;
  file_type: string;
}

export interface CampaignFilesResponse {
  ok: boolean;
  files: CampaignFile[];
}

// Sending Schedule Types
export interface SendingTimeWindow {
  days: string[]; // ["monday", "tuesday", ...]
  start_time: string; // "09:00" (HH:MM, 24-hour)
  end_time: string; // "17:00" (HH:MM, 24-hour)
}

export interface SendingSchedule {
  timezone: string; // IANA timezone
  windows: SendingTimeWindow[];
  enabled: boolean;
}

export interface SendingScheduleResponse {
  ok: boolean;
  timezone: string;
  windows: SendingTimeWindow[];
  enabled: boolean;
}

export interface CanSendNowResponse {
  ok: boolean;
  can_send: boolean;
  reason?: string;
}

// Sent Email Types
export interface SentEmail {
  id: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: EmailStatus;
  sent_at?: string;
  opened_at?: string;
  has_response: boolean;
}

export interface SentEmailsResponse {
  ok: boolean;
  sent_emails: SentEmail[];
  total: number;
  page: number;
  limit: number;
}

// Email Response Types
export interface AutoReply {
  id: number;
  subject: string;
  body: string;
  sent_at: string;
  status: "pending" | "sent" | "failed";
  error_message?: string;
}

export interface EmailResponse {
  id: number;
  from_email: string;
  subject: string;
  body: string;
  received_at: string;
  sentiment: Sentiment;
  sentiment_score: number;
  is_auto_replied: boolean;
  auto_reply_sent_at?: string;
  auto_replies?: AutoReply[];
}

export interface EmailResponsesResponse {
  ok: boolean;
  responses: EmailResponse[];
}

// Template Generation Types
export interface GenerateTemplateRequest {
  prompt: string;
  subject_line?: string;
  tone?: "professional" | "casual" | "friendly";
}

export interface GenerateTemplateResponse {
  ok: boolean;
  template: string;
  subject_line: string; // Always included
  available_variables: string[]; // e.g., ["{name}", "{company_name}", ...]
}

export interface ImproveTemplateRequest {
  template: string;
  subject_line?: string;
  improvement_direction?: string; // Optional guidance
}

export interface ImproveTemplateResponse {
  ok: boolean;
  template: string;
  subject_line: string; // Always included (empty if not provided)
}

// Auto-Reply Types
export interface AutoReplyConfig {
  auto_reply_enabled: boolean;
  auto_reply_theme: string | null;
}

export interface AutoReplyConfigResponse {
  ok: boolean;
  auto_reply_enabled: boolean;
  auto_reply_theme: string | null;
}

export interface UpdateAutoReplyRequest {
  auto_reply_enabled: boolean;
  auto_reply_theme?: string;
}

// ============================================================================
// Team Assignment Types
// ============================================================================

// Team Assignment Configuration
export interface TeamAssignmentConfigRequest {
  enabled: boolean;
}

export interface TeamAssignmentConfigResponse {
  ok: boolean;
  team_assignment_enabled: boolean;
}

// Campaign Team Member Assignment
export interface AssignmentDetails {
  role?: string;
  expertise?: string[];
  instructions?: string;
  handling_guidelines?: string;
  [key: string]: any; // Allow additional custom fields
}

export interface CampaignTeamMemberCreateRequest {
  team_member_id: number;
  assignment_details?: AssignmentDetails;
  priority?: number; // 1-10, default 5
}

export interface CampaignTeamMember {
  id: number;
  campaign_id: number;
  team_member_id: number;
  team_member_name: string;
  team_member_email: string;
  team_member_role?: string;
  assignment_details?: AssignmentDetails;
  priority: number;
  is_active: boolean;
  created_time: string;
  updated_time: string;
}

export interface CampaignTeamMemberResponse {
  ok: boolean;
  id: number;
  campaign_id: number;
  team_member_id: number;
  team_member_name: string;
  team_member_email: string;
  assignment_details?: AssignmentDetails;
  priority: number;
  is_active: boolean;
  created_time: string;
}

export interface CampaignTeamMembersListResponse {
  ok: boolean;
  team_members: CampaignTeamMember[];
}

export interface CampaignTeamMemberUpdateRequest {
  assignment_details?: AssignmentDetails;
  priority?: number; // 1-10
  is_active?: boolean;
}

// Email Assignment (Reporting)
export interface EmailAssignment {
  id: number;
  campaign_email_id: number;
  recipient_email: string;
  team_member_id: number;
  team_member_name: string;
  team_member_email: string;
  assigned_at: string;
  assigned_by_system: boolean; // TRUE = Lambda assigned, FALSE = Manual
  assignment_reason: string;
  is_active: boolean;
  handled_at?: string;
  notification_sent: boolean;
  notification_sent_at?: string;
}

export interface CampaignEmailAssignmentsListResponse {
  ok: boolean;
  assignments: EmailAssignment[];
}

export interface GetCampaignAssignmentsParams {
  team_member_id?: number;
  is_active?: boolean;
  limit?: number;
}

// Query Names
export const EmailOutreachQueryNames = {
  // Gmail
  GET_GMAIL_AUTH_URL: "EMAIL-OUTREACH-GET-GMAIL-AUTH-URL",
  GMAIL_CALLBACK: "EMAIL-OUTREACH-GMAIL-CALLBACK",
  GET_GMAIL_ACCOUNTS: "EMAIL-OUTREACH-GET-GMAIL-ACCOUNTS",
  DISCONNECT_GMAIL_ACCOUNT: "EMAIL-OUTREACH-DISCONNECT-GMAIL-ACCOUNT",
  GET_GMAIL_ACCOUNT_STATUS: "EMAIL-OUTREACH-GET-GMAIL-ACCOUNT-STATUS",
  REFRESH_GMAIL_ACCOUNT: "EMAIL-OUTREACH-REFRESH-GMAIL-ACCOUNT",
  GET_GMAIL_ACCOUNT_STATS: "EMAIL-OUTREACH-GET-GMAIL-ACCOUNT-STATS",
  UPDATE_GMAIL_LIMITS: "EMAIL-OUTREACH-UPDATE-GMAIL-LIMITS",

  // Team Members
  GET_TEAM_MEMBERS: "EMAIL-OUTREACH-GET-TEAM-MEMBERS",
  ADD_TEAM_MEMBER: "EMAIL-OUTREACH-ADD-TEAM-MEMBER",
  REMOVE_TEAM_MEMBER: "EMAIL-OUTREACH-REMOVE-TEAM-MEMBER",

  // Email Lists
  GET_EMAIL_LISTS: "EMAIL-OUTREACH-GET-EMAIL-LISTS",
  CREATE_EMAIL_LIST: "EMAIL-OUTREACH-CREATE-EMAIL-LIST",
  GET_LIST_CONTACTS: "EMAIL-OUTREACH-GET-LIST-CONTACTS",
  DELETE_EMAIL_LIST: "EMAIL-OUTREACH-DELETE-EMAIL-LIST",

  // Campaigns
  GET_CAMPAIGNS: "EMAIL-OUTREACH-GET-CAMPAIGNS",
  CREATE_CAMPAIGN: "EMAIL-OUTREACH-CREATE-CAMPAIGN",
  GET_CAMPAIGN: "EMAIL-OUTREACH-GET-CAMPAIGN",
  UPDATE_CAMPAIGN: "EMAIL-OUTREACH-UPDATE-CAMPAIGN",
  START_CAMPAIGN: "EMAIL-OUTREACH-START-CAMPAIGN",
  PAUSE_CAMPAIGN: "EMAIL-OUTREACH-PAUSE-CAMPAIGN",
  DELETE_CAMPAIGN: "EMAIL-OUTREACH-DELETE-CAMPAIGN",
  GET_CAMPAIGN_FILES: "EMAIL-OUTREACH-GET-CAMPAIGN-FILES",
  GET_SENDING_SCHEDULE: "EMAIL-OUTREACH-GET-SENDING-SCHEDULE",
  UPDATE_SENDING_SCHEDULE: "EMAIL-OUTREACH-UPDATE-SENDING-SCHEDULE",
  CAN_SEND_NOW: "EMAIL-OUTREACH-CAN-SEND-NOW",
  GET_CAMPAIGN_GMAIL_ACCOUNTS: "EMAIL-OUTREACH-GET-CAMPAIGN-GMAIL-ACCOUNTS",
  ADD_CAMPAIGN_GMAIL_ACCOUNT: "EMAIL-OUTREACH-ADD-CAMPAIGN-GMAIL-ACCOUNT",
  UPDATE_CAMPAIGN_GMAIL_ACCOUNT: "EMAIL-OUTREACH-UPDATE-CAMPAIGN-GMAIL-ACCOUNT",
  REMOVE_CAMPAIGN_GMAIL_ACCOUNT: "EMAIL-OUTREACH-REMOVE-CAMPAIGN-GMAIL-ACCOUNT",

  // Sent Emails
  GET_SENT_EMAILS: "EMAIL-OUTREACH-GET-SENT-EMAILS",
  GET_EMAIL_RESPONSES: "EMAIL-OUTREACH-GET-EMAIL-RESPONSES",

  // Template Generation
  GENERATE_TEMPLATE: "EMAIL-OUTREACH-GENERATE-TEMPLATE",
  IMPROVE_TEMPLATE: "EMAIL-OUTREACH-IMPROVE-TEMPLATE",

  // Auto-Reply
  GET_AUTO_REPLY_CONFIG: "EMAIL-OUTREACH-GET-AUTO-REPLY-CONFIG",
  UPDATE_AUTO_REPLY_CONFIG: "EMAIL-OUTREACH-UPDATE-AUTO-REPLY-CONFIG",

  // Campaign Emails (Multi-List Support)
  GET_CAMPAIGN_EMAILS: "EMAIL-OUTREACH-GET-CAMPAIGN-EMAILS",
  ADD_CAMPAIGN_EMAILS: "EMAIL-OUTREACH-ADD-CAMPAIGN-EMAILS",
  UPDATE_CAMPAIGN_EMAIL: "EMAIL-OUTREACH-UPDATE-CAMPAIGN-EMAIL",
  DELETE_CAMPAIGN_EMAIL: "EMAIL-OUTREACH-DELETE-CAMPAIGN-EMAIL",
  BULK_DELETE_CAMPAIGN_EMAILS: "EMAIL-OUTREACH-BULK-DELETE-CAMPAIGN-EMAILS",

  // Team Assignment
  ENABLE_TEAM_ASSIGNMENT: "EMAIL-OUTREACH-ENABLE-TEAM-ASSIGNMENT",
  GET_CAMPAIGN_TEAM_MEMBERS: "EMAIL-OUTREACH-GET-CAMPAIGN-TEAM-MEMBERS",
  ADD_CAMPAIGN_TEAM_MEMBER: "EMAIL-OUTREACH-ADD-CAMPAIGN-TEAM-MEMBER",
  UPDATE_CAMPAIGN_TEAM_MEMBER: "EMAIL-OUTREACH-UPDATE-CAMPAIGN-TEAM-MEMBER",
  REMOVE_CAMPAIGN_TEAM_MEMBER: "EMAIL-OUTREACH-REMOVE-CAMPAIGN-TEAM-MEMBER",
  GET_CAMPAIGN_ASSIGNMENTS: "EMAIL-OUTREACH-GET-CAMPAIGN-ASSIGNMENTS",
};

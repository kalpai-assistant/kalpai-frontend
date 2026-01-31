import { AxiosResponse } from "axios";
import { apiClient } from "../apiHelper";
import type {
  WhatsAppAccountsResponse,
  DisconnectAccountResponse,
  RequestAccountRequest,
  RequestAccountResponse,
  CreateTemplateRequest,
  CreateTemplateResponse,
  TemplatesResponse,
  CreateCampaignRequest,
  CreateCampaignResponse,
  AddRecipientsRequest,
  AddRecipientsResponse,
  CampaignsResponse,
  CampaignStatsResponse,
  CampaignQuotaResponse,
  StartCampaignResponse,
  PauseCampaignResponse,
  ChatSessionsResponse,
  ChatMessagesResponse,
  EnableWhatsAppResponse,
  SetupProfileRequest,
  SetupProfileResponse,
} from "../requests_responses/outreach/whatsapp";

// ============================================================================
// Account Management APIs
// ============================================================================

/**
 * Request a new WhatsApp account (Twilio)
 */
export const requestWhatsAppAccount = async (
  data: RequestAccountRequest,
): Promise<AxiosResponse<RequestAccountResponse>> => {
  return apiClient.post<RequestAccountResponse>(
    "/api/v1/whatsapp/request-account",
    data,
  );
};

/**
 * Get all connected WhatsApp accounts
 */
export const getWhatsAppAccounts = async (): Promise<
  AxiosResponse<WhatsAppAccountsResponse>
> => {
  return apiClient.get<WhatsAppAccountsResponse>("/api/v1/whatsapp/accounts");
};

/**
 * Disconnect WhatsApp account
 */
export const disconnectWhatsAppAccount = async (
  accountId: number,
): Promise<AxiosResponse<DisconnectAccountResponse>> => {
  return apiClient.delete<DisconnectAccountResponse>(
    `/api/v1/whatsapp/accounts/${accountId}`,
  );
};

/**
 * Enable WhatsApp (Provision Number)
 */
export const enableWhatsApp = async (): Promise<
  AxiosResponse<EnableWhatsAppResponse>
> => {
  return apiClient.post<EnableWhatsAppResponse>("/api/v1/whatsapp/enable");
};

/**
 * Setup WhatsApp Business Profile
 */
export const setupWhatsAppProfile = async (
  data: SetupProfileRequest,
): Promise<AxiosResponse<SetupProfileResponse>> => {
  return apiClient.post<SetupProfileResponse>("/api/v1/whatsapp/profile", data);
};

// ============================================================================
// Template Management APIs
// ============================================================================

/**
 * Get all templates for a WhatsApp account
 */
export const getTemplates = async (
  accountId: number,
  status?: string,
): Promise<AxiosResponse<TemplatesResponse>> => {
  const params = status ? { status } : {};
  return apiClient.get<TemplatesResponse>(
    `/api/v1/whatsapp/accounts/${accountId}/templates`,
    { params },
  );
};

/**
 * Create new message template
 */
export const createTemplate = async (
  accountId: number,
  data: CreateTemplateRequest,
): Promise<AxiosResponse<CreateTemplateResponse>> => {
  return apiClient.post<CreateTemplateResponse>(
    `/api/v1/whatsapp/accounts/${accountId}/templates`,
    data,
  );
};

/**
 * Delete template
 */
export const deleteTemplate = async (
  templateId: number,
): Promise<AxiosResponse<{ success: boolean }>> => {
  return apiClient.delete<{ success: boolean }>(
    `/api/v1/whatsapp/templates/${templateId}`,
  );
};

// ============================================================================
// Campaign Management APIs
// ============================================================================

/**
 * Get all campaigns
 */
export const getCampaigns = async (): Promise<
  AxiosResponse<CampaignsResponse>
> => {
  return apiClient.get<CampaignsResponse>("/api/v1/whatsapp/campaigns");
};

/**
 * Create new campaign
 */
export const createCampaign = async (
  data: CreateCampaignRequest,
): Promise<AxiosResponse<CreateCampaignResponse>> => {
  return apiClient.post<CreateCampaignResponse>(
    "/api/v1/whatsapp/campaigns",
    data,
  );
};

/**
 * Get campaign details
 */
export const getCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<CreateCampaignResponse>> => {
  return apiClient.get<CreateCampaignResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}`,
  );
};

/**
 * Add recipients to campaign
 */
export const addCampaignRecipients = async (
  campaignId: number,
  data: AddRecipientsRequest,
): Promise<AxiosResponse<AddRecipientsResponse>> => {
  return apiClient.post<AddRecipientsResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}/recipients`,
    data,
  );
};

/**
 * Start campaign
 */
export const startCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<StartCampaignResponse>> => {
  return apiClient.post<StartCampaignResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}/start`,
  );
};

/**
 * Pause campaign
 */
export const pauseCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<PauseCampaignResponse>> => {
  return apiClient.post<PauseCampaignResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}/pause`,
  );
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (
  campaignId: number,
): Promise<AxiosResponse<CampaignStatsResponse>> => {
  return apiClient.get<CampaignStatsResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}/stats`,
  );
};

/**
 * Get campaign quota
 */
export const getCampaignQuota = async (
  campaignId: number,
): Promise<AxiosResponse<CampaignQuotaResponse>> => {
  return apiClient.get<CampaignQuotaResponse>(
    `/api/v1/whatsapp/campaigns/${campaignId}/quota`,
  );
};

// ============================================================================
// AI Chat APIs
// ============================================================================

/**
 * Get all chat sessions (filtered by WhatsApp source)
 */
export const getChatSessions = async (): Promise<
  AxiosResponse<ChatSessionsResponse>
> => {
  return apiClient.get<ChatSessionsResponse>("/api/v1/chat/sessions", {
    params: {
      source_type: "WHATSAPP",
    },
  });
};

/**
 * Get messages for a chat session
 */
export const getChatMessages = async (
  sessionId: number,
): Promise<AxiosResponse<ChatMessagesResponse>> => {
  return apiClient.get<ChatMessagesResponse>("/api/v1/chat/messages", {
    params: {
      session_id: sessionId,
    },
  });
};

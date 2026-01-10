import { AxiosResponse } from "axios";
import { apiClient } from "../apiHelper";
import {
  //   GmailAccount,
  GmailAuthUrlResponse,
  GmailCallbackRequest,
  GmailCallbackResponse,
  GmailAccountsResponse,
  GmailAccountStatusResponse,
  GmailAccountRefreshResponse,
  GmailAccountStats,
  UpdateGmailLimitsRequest,
  UpdateGmailLimitsResponse,
  //   TeamMember,
  TeamMemberRequest,
  TeamMemberResponse,
  TeamMembersResponse,
  //   EmailList,
  EmailListResponse,
  EmailListsResponse,
  ContactsResponse,
  //   Campaign,
  CampaignRequest,
  CampaignResponse,
  CampaignsResponse,
  CampaignUpdateRequest,
  CampaignContentUpdateRequest,
  CampaignContentUpdateResponse,
  CampaignFilesResponse,
  SendingScheduleResponse,
  SendingSchedule,
  CanSendNowResponse,
  AddCampaignGmailAccountRequest,
  AddCampaignGmailAccountResponse,
  UpdateCampaignGmailAccountRequest,
  UpdateCampaignGmailAccountResponse,
  SentEmailsResponse,
  EmailResponsesResponse,
  GenerateTemplateRequest,
  GenerateTemplateResponse,
  ImproveTemplateRequest,
  ImproveTemplateResponse,
  CampaignGmailAccount,
  CampaignEmailsResponse,
  AddCampaignEmailsRequest,
  AddCampaignEmailsResponse,
  UpdateCampaignEmailRequest,
  BulkDeleteCampaignEmailsRequest,
  BulkDeleteCampaignEmailsResponse,
  AutoReplyConfigResponse,
  UpdateAutoReplyRequest,
  GetCampaignAssignmentsParams,
  TeamAssignmentConfigRequest,
  TeamAssignmentConfigResponse,
  CampaignTeamMemberCreateRequest,
  CampaignTeamMemberResponse,
  CampaignTeamMembersListResponse,
  CampaignTeamMemberUpdateRequest,
  CampaignEmailAssignmentsListResponse,
} from "../requests_responses/outreach/email";

// Gmail Account APIs
// Backend generates state and stores business_id in Redis
// No params needed - auth token is automatically sent via axios headers
export const getGmailAuthUrl = async (): Promise<
  AxiosResponse<GmailAuthUrlResponse>
> => {
  return apiClient.get<GmailAuthUrlResponse>(
    "/api/v1/email-outreach/gmail/auth-url",
  );
};

export const gmailCallback = async (
  data: GmailCallbackRequest,
): Promise<AxiosResponse<GmailCallbackResponse>> => {
  return apiClient.post<GmailCallbackResponse>(
    "/api/v1/email-outreach/gmail/callback",
    data,
  );
};

export const getGmailAccounts = async (): Promise<
  AxiosResponse<GmailAccountsResponse>
> => {
  return apiClient.get<GmailAccountsResponse>(
    "/api/v1/email-outreach/gmail/accounts",
  );
};

export const disconnectGmailAccount = async (
  accountId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/gmail/accounts/${accountId}`,
  );
};

export const getGmailAccountStatus = async (
  accountId: number,
): Promise<AxiosResponse<GmailAccountStatusResponse>> => {
  return apiClient.get<GmailAccountStatusResponse>(
    `/api/v1/email-outreach/gmail/accounts/${accountId}/status`,
  );
};

export const refreshGmailAccount = async (
  accountId: number,
): Promise<AxiosResponse<GmailAccountRefreshResponse>> => {
  return apiClient.post<GmailAccountRefreshResponse>(
    `/api/v1/email-outreach/gmail/accounts/${accountId}/refresh`,
  );
};

// Gmail Account Stats (Multi-Sender)
export const getGmailAccountStats = async (
  accountId: number,
  forceRefresh: boolean = false,
): Promise<AxiosResponse<GmailAccountStats>> => {
  return apiClient.get<GmailAccountStats>(
    `/api/v1/email-outreach/gmail/accounts/${accountId}/stats?force_refresh=${forceRefresh}`,
  );
};

export const updateGmailLimits = async (
  accountId: number,
  data: UpdateGmailLimitsRequest,
): Promise<AxiosResponse<UpdateGmailLimitsResponse>> => {
  return apiClient.put<UpdateGmailLimitsResponse>(
    `/api/v1/email-outreach/gmail/accounts/${accountId}/limits`,
    data,
  );
};

// Team Member APIs
export const getTeamMembers = async (): Promise<
  AxiosResponse<TeamMembersResponse>
> => {
  return apiClient.get<TeamMembersResponse>(
    "/api/v1/email-outreach/team-members",
  );
};

export const addTeamMember = async (
  data: TeamMemberRequest,
): Promise<AxiosResponse<TeamMemberResponse>> => {
  return apiClient.post<TeamMemberResponse>(
    "/api/v1/email-outreach/team-members",
    data,
  );
};

export const removeTeamMember = async (
  memberId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/team-members/${memberId}`,
  );
};

// Email List APIs
export const getEmailLists = async (): Promise<
  AxiosResponse<EmailListsResponse>
> => {
  return apiClient.get<EmailListsResponse>(
    "/api/v1/email-outreach/email-lists",
  );
};

export const createEmailList = async (
  formData: FormData,
): Promise<AxiosResponse<EmailListResponse>> => {
  return apiClient.postForFiles<EmailListResponse>(
    "/api/v1/email-outreach/email-lists",
    formData,
  );
};

export const getListContacts = async (
  listId: number,
  params?: { page?: number; limit?: number },
): Promise<AxiosResponse<ContactsResponse>> => {
  return apiClient.get<ContactsResponse>(
    `/api/v1/email-outreach/email-lists/${listId}/contacts`,
    params,
  );
};

export const deleteEmailList = async (
  listId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/email-lists/${listId}`,
  );
};

// Campaign APIs
export const getCampaigns = async (params?: {
  status?: string;
}): Promise<AxiosResponse<CampaignsResponse>> => {
  return apiClient.get<CampaignsResponse>(
    "/api/v1/email-outreach/campaigns",
    params,
  );
};

export const createCampaign = async (
  data: CampaignRequest | FormData,
): Promise<AxiosResponse<CampaignResponse>> => {
  // Check if data is FormData (for image uploads)
  if (data instanceof FormData) {
    return apiClient.postForFiles<CampaignResponse>(
      "/api/v1/email-outreach/campaigns",
      data,
    );
  }
  // Regular JSON request
  return apiClient.post<CampaignResponse>(
    "/api/v1/email-outreach/campaigns",
    data,
  );
};

export const getCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<CampaignResponse>> => {
  return apiClient.get<CampaignResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}`,
  );
};

export const updateCampaign = async (
  campaignId: number,
  data: CampaignUpdateRequest | FormData,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  // Check if data is FormData (for image uploads)
  if (data instanceof FormData) {
    return apiClient.putForFiles<{ ok: boolean }>(
      `/api/v1/email-outreach/campaigns/${campaignId}`,
      data,
    );
  }
  // Regular JSON request
  return apiClient.update<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}`,
    data,
  );
};

// Update campaign content (subject, template, ai_flavor) with file support
export const updateCampaignContent = async (
  campaignId: number,
  data: CampaignContentUpdateRequest | FormData,
): Promise<AxiosResponse<CampaignContentUpdateResponse>> => {
  // Check if data is FormData (for image uploads)
  if (data instanceof FormData) {
    return apiClient.putForFiles<CampaignContentUpdateResponse>(
      `/api/v1/email-outreach/campaigns/${campaignId}/content`,
      data,
    );
  }
  // Regular JSON request
  return apiClient.put<CampaignContentUpdateResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/content`,
    data,
  );
};

export const getCampaignFiles = async (
  campaignId: number,
): Promise<AxiosResponse<CampaignFilesResponse>> => {
  return apiClient.get<CampaignFilesResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/files`,
  );
};

export const startCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.post<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/start`,
  );
};

export const pauseCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.post<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/pause`,
  );
};

export const deleteCampaign = async (
  campaignId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}`,
  );
};

// Sending Schedule APIs
export const getSendingSchedule = async (
  campaignId: number,
): Promise<AxiosResponse<SendingScheduleResponse>> => {
  return apiClient.get<SendingScheduleResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/sending-schedule`,
  );
};

export const updateSendingSchedule = async (
  campaignId: number,
  data: Partial<SendingSchedule>,
): Promise<AxiosResponse<SendingScheduleResponse>> => {
  return apiClient.put<SendingScheduleResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/sending-schedule`,
    data,
  );
};

export const canSendNow = async (
  campaignId: number,
): Promise<AxiosResponse<CanSendNowResponse>> => {
  return apiClient.get<CanSendNowResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/can-send-now`,
  );
};

// Campaign Gmail Accounts (Multi-Sender)
export const getCampaignGmailAccounts = async (
  campaignId: number,
): Promise<AxiosResponse<CampaignGmailAccount[]>> => {
  return apiClient.get<CampaignGmailAccount[]>(
    `/api/v1/email-outreach/campaigns/${campaignId}/gmail-accounts`,
  );
};

export const addCampaignGmailAccount = async (
  campaignId: number,
  data: AddCampaignGmailAccountRequest,
): Promise<AxiosResponse<AddCampaignGmailAccountResponse>> => {
  return apiClient.post<AddCampaignGmailAccountResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/gmail-accounts`,
    data,
  );
};

export const updateCampaignGmailAccount = async (
  campaignId: number,
  mappingId: number,
  data: UpdateCampaignGmailAccountRequest,
): Promise<AxiosResponse<UpdateCampaignGmailAccountResponse>> => {
  return apiClient.put<UpdateCampaignGmailAccountResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/gmail-accounts/${mappingId}`,
    data,
  );
};

export const removeCampaignGmailAccount = async (
  campaignId: number,
  mappingId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/gmail-accounts/${mappingId}`,
  );
};

// Sent Email APIs
export const getSentEmails = async (
  campaignId: number,
  params?: { page?: number; limit?: number; status?: string },
): Promise<AxiosResponse<SentEmailsResponse>> => {
  return apiClient.get<SentEmailsResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/sent-emails`,
    params,
  );
};

export const getEmailResponses = async (
  sentEmailId: number,
): Promise<AxiosResponse<EmailResponsesResponse>> => {
  return apiClient.get<EmailResponsesResponse>(
    `/api/v1/email-outreach/sent-emails/${sentEmailId}/responses`,
  );
};

// Template Generation APIs
export const generateTemplate = async (
  data: GenerateTemplateRequest,
): Promise<AxiosResponse<GenerateTemplateResponse>> => {
  return apiClient.post<GenerateTemplateResponse>(
    "/api/v1/email-outreach/templates/generate",
    data,
  );
};

export const improveTemplate = async (
  data: ImproveTemplateRequest,
): Promise<AxiosResponse<ImproveTemplateResponse>> => {
  return apiClient.post<ImproveTemplateResponse>(
    "/api/v1/email-outreach/templates/improve",
    data,
  );
};

// Campaign Emails APIs (Multi-List Support)
export const getCampaignEmails = async (
  campaignId: number,
  params?: { status?: string; page?: number; limit?: number },
): Promise<AxiosResponse<CampaignEmailsResponse>> => {
  return apiClient.get<CampaignEmailsResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/emails`,
    params,
  );
};

export const addCampaignEmails = async (
  campaignId: number,
  data: AddCampaignEmailsRequest,
): Promise<AxiosResponse<AddCampaignEmailsResponse>> => {
  return apiClient.post<AddCampaignEmailsResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/emails`,
    data,
  );
};

export const updateCampaignEmail = async (
  campaignId: number,
  emailId: number,
  data: UpdateCampaignEmailRequest,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.update<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/emails/${emailId}`,
    data,
  );
};

export const deleteCampaignEmail = async (
  campaignId: number,
  emailId: number,
): Promise<AxiosResponse<{ ok: boolean }>> => {
  return apiClient.delete<{ ok: boolean }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/emails/${emailId}`,
  );
};

export const bulkDeleteCampaignEmails = async (
  campaignId: number,
  data: BulkDeleteCampaignEmailsRequest,
): Promise<AxiosResponse<BulkDeleteCampaignEmailsResponse>> => {
  return apiClient.post<BulkDeleteCampaignEmailsResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/emails/bulk-delete`,
    data,
  );
};

// Auto-Reply APIs
export const getAutoReplyConfig = async (
  campaignId: number,
): Promise<AxiosResponse<AutoReplyConfigResponse>> => {
  return apiClient.get<AutoReplyConfigResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/auto-reply`,
  );
};

export const updateAutoReplyConfig = async (
  campaignId: number,
  data: UpdateAutoReplyRequest,
): Promise<AxiosResponse<AutoReplyConfigResponse>> => {
  return apiClient.put<AutoReplyConfigResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/auto-reply`,
    data,
  );
};

// ============================================================================
// Team Assignment APIs
// ============================================================================

// Enable/Disable Team Assignment
export const enableTeamAssignment = async (
  campaignId: number,
  data: TeamAssignmentConfigRequest,
): Promise<AxiosResponse<TeamAssignmentConfigResponse>> => {
  return apiClient.put<TeamAssignmentConfigResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/team-assignment`,
    data,
  );
};

// Get Campaign Team Members
export const getCampaignTeamMembers = async (
  campaignId: number,
  isActive?: boolean,
): Promise<AxiosResponse<CampaignTeamMembersListResponse>> => {
  const params = isActive !== undefined ? { is_active: isActive } : {};
  return apiClient.get<CampaignTeamMembersListResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/team-members`,
    params,
  );
};

// Add Team Member to Campaign
export const addCampaignTeamMember = async (
  campaignId: number,
  data: CampaignTeamMemberCreateRequest,
): Promise<AxiosResponse<CampaignTeamMemberResponse>> => {
  return apiClient.post<CampaignTeamMemberResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/team-members`,
    data,
  );
};

// Update Team Member Assignment
export const updateCampaignTeamMember = async (
  campaignId: number,
  assignmentId: number,
  data: CampaignTeamMemberUpdateRequest,
): Promise<AxiosResponse<CampaignTeamMemberResponse>> => {
  return apiClient.put<CampaignTeamMemberResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/team-members/${assignmentId}`,
    data,
  );
};

// Remove Team Member from Campaign
export const removeCampaignTeamMember = async (
  campaignId: number,
  assignmentId: number,
): Promise<AxiosResponse<{ ok: boolean; message: string }>> => {
  return apiClient.delete<{ ok: boolean; message: string }>(
    `/api/v1/email-outreach/campaigns/${campaignId}/team-members/${assignmentId}`,
  );
};

// Get Email Assignments (Reporting)
export const getCampaignEmailAssignments = async (
  campaignId: number,
  params?: GetCampaignAssignmentsParams,
): Promise<AxiosResponse<CampaignEmailAssignmentsListResponse>> => {
  return apiClient.get<CampaignEmailAssignmentsListResponse>(
    `/api/v1/email-outreach/campaigns/${campaignId}/assignments`,
    params || {},
  );
};

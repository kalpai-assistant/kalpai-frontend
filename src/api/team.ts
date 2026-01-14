// API Module for Team Member Management
import { AxiosResponse } from "axios";
import { apiClient } from "./apiHelper";
import {
  TeamMember,
  TeamMemberFilters,
  TeamMembersResponse,
  InviteTeamMemberRequest,
  InviteTeamMemberResponse,
  UpdateTeamMemberRequest,
  UpdateTeamMemberRoleRequest,
  StandardTeamResponse,
  TeamStatsResponse,
} from "./requests_responses/team";

// Get All Team Members
export const getTeamMembers = async (
  filters?: TeamMemberFilters,
): Promise<AxiosResponse<TeamMembersResponse>> => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined) {
    params.append("is_active", String(filters.is_active));
  }
  if (filters?.invitation_status) {
    params.append("invitation_status", filters.invitation_status);
  }
  if (filters?.role_type) {
    params.append("role_type", filters.role_type);
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/api/v1/team/members?${queryString}`
    : "/api/v1/team/members";

  return apiClient.get<TeamMembersResponse>(endpoint);
};

// Invite Team Member
export const inviteTeamMember = async (
  request: InviteTeamMemberRequest,
): Promise<AxiosResponse<InviteTeamMemberResponse>> => {
  return apiClient.post<InviteTeamMemberResponse>(
    "/api/v1/team/invite",
    request,
  );
};

// Get Single Team Member
export const getTeamMember = async (
  memberId: number,
): Promise<AxiosResponse<TeamMember>> => {
  return apiClient.get<TeamMember>(`/api/v1/team/members/${memberId}`);
};

// Update Team Member
export const updateTeamMember = async (
  memberId: number,
  request: UpdateTeamMemberRequest,
): Promise<AxiosResponse<TeamMember>> => {
  return apiClient.put<TeamMember>(`/api/v1/team/members/${memberId}`, request);
};

// Update Team Member Role
export const updateTeamMemberRole = async (
  memberId: number,
  request: UpdateTeamMemberRoleRequest,
): Promise<AxiosResponse<TeamMember>> => {
  return apiClient.put<TeamMember>(
    `/api/v1/team/members/${memberId}/role`,
    request,
  );
};

// Remove Team Member
export const removeTeamMember = async (
  memberId: number,
): Promise<AxiosResponse<StandardTeamResponse>> => {
  return apiClient.delete<StandardTeamResponse>(
    `/api/v1/team/members/${memberId}`,
  );
};

// Accept Invitation
export const acceptInvitation = async (
  memberId: number,
): Promise<AxiosResponse<StandardTeamResponse>> => {
  return apiClient.post<StandardTeamResponse>(
    `/api/v1/team/invitations/${memberId}/accept`,
  );
};

// Decline Invitation
export const declineInvitation = async (
  memberId: number,
): Promise<AxiosResponse<StandardTeamResponse>> => {
  return apiClient.post<StandardTeamResponse>(
    `/api/v1/team/invitations/${memberId}/decline`,
  );
};

// Resend Invitation
export const resendInvitation = async (
  memberId: number,
): Promise<AxiosResponse<StandardTeamResponse>> => {
  return apiClient.post<StandardTeamResponse>(
    `/api/v1/team/members/${memberId}/resend-invitation`,
  );
};

// Get Team Statistics
export const getTeamStats = async (): Promise<
  AxiosResponse<TeamStatsResponse>
> => {
  return apiClient.get<TeamStatsResponse>("/api/v1/team/stats");
};

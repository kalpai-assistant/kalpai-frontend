// Team Member Request and Response Types

// Team Member Entity
export interface TeamMember {
  id: number;
  business_id: number;
  email: string;
  name: string | null;
  role: string | null; // Descriptive role like "Sales Manager"
  description: string | null;

  // Invitation
  invitation_status: "pending" | "active" | "declined";
  invited_by: number | null;
  invited_at: string | null;
  accepted_at: string | null;

  // Access
  last_login: string | null;

  // Permissions
  role_type: "owner" | "admin" | "member" | "viewer";
  permissions: Record<string, any>;

  // Status
  is_active: boolean;

  // Timestamps
  created_time: string;
  updated_time: string;
}

// Request Types
export interface TeamMemberFilters {
  is_active?: boolean;
  invitation_status?: "pending" | "active" | "declined";
  role_type?: "owner" | "admin" | "member" | "viewer";
}

export interface InviteTeamMemberRequest {
  email: string;
  name: string;
  role: string;
  description?: string;
  role_type: "owner" | "admin" | "member" | "viewer";
  permissions?: Record<string, any>;
}

export interface UpdateTeamMemberRequest {
  name?: string;
  role?: string;
  description?: string;
  role_type?: "owner" | "admin" | "member" | "viewer";
  permissions?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateTeamMemberRoleRequest {
  role_type: "owner" | "admin" | "member" | "viewer";
  permissions?: Record<string, any>;
}

// Response Types
export interface TeamMembersResponse {
  team_members: TeamMember[];
}

export interface TeamStatsResponse {
  total_members: number;
  active_members: number;
  pending_invitations: number;
  by_role_type: {
    owner?: number;
    admin?: number;
    member?: number;
    viewer?: number;
  };
}

export interface InviteTeamMemberResponse {
  id: number;
  email: string;
  invitation_status: string;
  invited_at: string;
  message: string;
}

export interface StandardTeamResponse {
  message: string;
}

// Query Names for React Query
export const TeamQueryNames = {
  GET_TEAM_MEMBERS: "GET-TEAM-MEMBERS",
  GET_TEAM_MEMBER: "GET-TEAM-MEMBER",
  GET_TEAM_STATS: "GET-TEAM-STATS",
  INVITE_TEAM_MEMBER: "INVITE-TEAM-MEMBER",
  UPDATE_TEAM_MEMBER: "UPDATE-TEAM-MEMBER",
  UPDATE_TEAM_MEMBER_ROLE: "UPDATE-TEAM-MEMBER-ROLE",
  REMOVE_TEAM_MEMBER: "REMOVE-TEAM-MEMBER",
  ACCEPT_INVITATION: "ACCEPT-INVITATION",
  DECLINE_INVITATION: "DECLINE-INVITATION",
  RESEND_INVITATION: "RESEND-INVITATION",
};

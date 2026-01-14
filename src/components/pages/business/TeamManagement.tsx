import { useState } from "react";
import {
  Container,
  Title,
  Button,
  Flex,
  Tabs,
  TextInput,
  Paper,
  Text,
} from "@mantine/core";
import { IconUserPlus, IconSearch } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getTeamMembers,
  getTeamStats,
  removeTeamMember,
  resendInvitation,
} from "../../../api/team";
import {
  TeamQueryNames,
  TeamMember,
} from "../../../api/requests_responses/team";
import TeamStatsCard from "./team/TeamStatsCard";
import TeamMemberList from "./team/TeamMemberList";
import InviteTeamMemberModal from "./team/InviteTeamMemberModal";
import TeamMemberDetailsModal from "./team/TeamMemberDetailsModal";
import UpdateTeamMemberModal from "./team/UpdateTeamMemberModal";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

const TeamManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [inviteModalOpened, setInviteModalOpened] = useState(false);
  const [detailsModalOpened, setDetailsModalOpened] = useState(false);
  const [updateModalOpened, setUpdateModalOpened] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string | null>("all");

  // Fetch team members
  const { data: membersData, isLoading: membersLoading } = useQuery(
    [TeamQueryNames.GET_TEAM_MEMBERS],
    () => getTeamMembers(),
    {
      refetchOnWindowFocus: false,
    },
  );

  // Fetch team stats
  const { data: statsData, isLoading: statsLoading } = useQuery(
    [TeamQueryNames.GET_TEAM_STATS],
    () => getTeamStats(),
    {
      refetchOnWindowFocus: false,
    },
  );

  // Remove team member mutation
  const { mutate: removeMutation } = useMutation(
    (memberId: number) => removeTeamMember(memberId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_MEMBERS);
        queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_STATS);
        notifications.show({
          title: "Success",
          message: "Team member removed successfully",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.detail || "Failed to remove team member",
          color: "red",
        });
      },
    },
  );

  // Resend invitation mutation
  const { mutate: resendMutation } = useMutation(
    (memberId: number) => resendInvitation(memberId),
    {
      onSuccess: () => {
        notifications.show({
          title: "Success",
          message: "Invitation resent successfully",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.detail || "Failed to resend invitation",
          color: "red",
        });
      },
    },
  );

  const members = membersData?.data?.team_members || [];
  const stats = statsData?.data || {
    total_members: 0,
    active_members: 0,
    pending_invitations: 0,
    by_role_type: {},
  };

  // Filter members based on search and tab
  const filteredMembers = members.filter((member) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === "active") {
      matchesTab = member.invitation_status === "active";
    } else if (activeTab === "pending") {
      matchesTab = member.invitation_status === "pending";
    }

    return matchesSearch && matchesTab;
  });

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setDetailsModalOpened(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setUpdateModalOpened(true);
  };

  const handleRemove = (memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    modals.openConfirmModal({
      title: "Remove Team Member",
      children: (
        <Text size="sm">
          Are you sure you want to remove{" "}
          <strong>{member?.name || member?.email}</strong> from the team? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => removeMutation(memberId),
    });
  };

  const handleResendInvitation = (memberId: number) => {
    resendMutation(memberId);
  };

  return (
    <Container size="xl" p="md">
      {/* Header */}
      <Flex justify="space-between" align="center" mb="xl" wrap="wrap" gap="md">
        <div>
          <Title order={2}>Team Management</Title>
          <Text size="sm" c="dimmed">
            Manage your team members and their access levels
          </Text>
        </div>
        <Button
          leftSection={<IconUserPlus size={16} />}
          onClick={() => setInviteModalOpened(true)}
          size="md"
        >
          Invite Team Member
        </Button>
      </Flex>

      {/* Stats Cards */}
      <TeamStatsCard stats={stats} loading={statsLoading} />

      {/* Search and Tabs */}
      <Paper p="md" mt="xl" withBorder>
        <Flex gap="md" mb="md" wrap="wrap">
          <TextInput
            placeholder="Search by name, email, or role..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 250 }}
          />
        </Flex>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="all">All Members ({members.length})</Tabs.Tab>
            <Tabs.Tab value="active">
              Active (
              {members.filter((m) => m.invitation_status === "active").length})
            </Tabs.Tab>
            <Tabs.Tab value="pending">
              Pending (
              {members.filter((m) => m.invitation_status === "pending").length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="md">
            <TeamMemberList
              members={filteredMembers}
              loading={membersLoading}
              onMemberClick={handleMemberClick}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onResendInvitation={handleResendInvitation}
            />
          </Tabs.Panel>

          <Tabs.Panel value="active" pt="md">
            <TeamMemberList
              members={filteredMembers}
              loading={membersLoading}
              onMemberClick={handleMemberClick}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onResendInvitation={handleResendInvitation}
            />
          </Tabs.Panel>

          <Tabs.Panel value="pending" pt="md">
            <TeamMemberList
              members={filteredMembers}
              loading={membersLoading}
              onMemberClick={handleMemberClick}
              onEdit={handleEdit}
              onRemove={handleRemove}
              onResendInvitation={handleResendInvitation}
            />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Modals */}
      <InviteTeamMemberModal
        opened={inviteModalOpened}
        onClose={() => setInviteModalOpened(false)}
      />
      <TeamMemberDetailsModal
        opened={detailsModalOpened}
        onClose={() => setDetailsModalOpened(false)}
        member={selectedMember}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
      <UpdateTeamMemberModal
        opened={updateModalOpened}
        onClose={() => setUpdateModalOpened(false)}
        member={selectedMember}
      />
    </Container>
  );
};

export default TeamManagement;

import React, { useState } from "react";
import {
  Stack,
  Button,
  Alert,
  Card,
  Group,
  Text,
  Badge,
  ActionIcon,
  Loader,
  Paper,
  Divider,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  IconAlertCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconStar,
} from "@tabler/icons-react";
import {
  getCampaignTeamMembers,
  removeCampaignTeamMember,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignTeamMember,
} from "../../../../../api/requests_responses/outreach/email";
import AddCampaignTeamMemberModal from "./AddCampaignTeamMemberModal";
import EditCampaignTeamMemberModal from "./EditCampaignTeamMemberModal";

// ============================================================================
// Types
// ============================================================================

interface CampaignTeamMembersListProps {
  campaignId: number;
  teamAssignmentEnabled: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

const CampaignTeamMembersList: React.FC<CampaignTeamMembersListProps> = ({
  campaignId,
  teamAssignmentEnabled,
}) => {
  const queryClient = useQueryClient();
  const [addModalOpened, setAddModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<CampaignTeamMember | null>(null);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: membersResponse, isLoading } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGN_TEAM_MEMBERS, campaignId],
    () => getCampaignTeamMembers(campaignId, true),
    {
      enabled: teamAssignmentEnabled,
      refetchOnWindowFocus: false,
    },
  );

  // ============================================================================
  // Mutations
  // ============================================================================

  const removeMutation = useMutation(
    (assignmentId: number) =>
      removeCampaignTeamMember(campaignId, assignmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_TEAM_MEMBERS,
          campaignId,
        ]);
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleEdit = (member: CampaignTeamMember) => {
    setSelectedMember(member);
    setEditModalOpened(true);
  };

  const handleRemove = (member: CampaignTeamMember) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${member.team_member_name} from this campaign? They will no longer receive email assignments.`,
      )
    ) {
      removeMutation.mutate(member.id);
    }
  };

  // ============================================================================
  // Derived Data
  // ============================================================================

  const members = membersResponse?.data?.team_members || [];

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const getPriorityColor = (priority: number): string => {
    if (priority >= 8) return "green";
    if (priority >= 5) return "yellow";
    return "gray";
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!teamAssignmentEnabled) {
    return (
      <Alert color="blue" icon={<IconAlertCircle size={16} />}>
        <Text size="sm">
          Team Assignment is not enabled for this campaign. Enable it in the
          settings to assign team members.
        </Text>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading team members...
        </Text>
      </Group>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="lg" fw={600}>
            Assigned Team Members
          </Text>
          <Text size="sm" c="dimmed">
            {members.length} team member{members.length !== 1 ? "s" : ""}{" "}
            assigned
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setAddModalOpened(true)}
        >
          Add Team Member
        </Button>
      </Group>

      {members.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconUser size={48} stroke={1.5} opacity={0.3} />
            <Text size="md" fw={500} c="dimmed">
              No team members assigned
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Add team members to enable team assignment. The AI will
              intelligently assign email responses based on member expertise and
              assignment details.
            </Text>
            <Alert
              color="blue"
              icon={<IconAlertCircle size={16} />}
              variant="light"
            >
              <Text size="sm">
                <strong>Note:</strong> If no team members are assigned, ALL
                business-level team members will be used as fallback for team
                assignment.
              </Text>
            </Alert>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddModalOpened(true)}
            >
              Add First Team Member
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Stack gap="sm">
          {members.map((member) => (
            <Card key={member.id} padding="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm">
                    <IconUser size={20} />
                    <div>
                      <Group gap="xs">
                        <Text fw={600}>{member.team_member_name}</Text>
                        <Badge
                          size="sm"
                          color={getPriorityColor(member.priority)}
                          leftSection={<IconStar size={12} />}
                        >
                          Priority {member.priority}
                        </Badge>
                        {!member.is_active && (
                          <Badge size="sm" color="gray">
                            Inactive
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed">
                        {member.team_member_email}
                      </Text>
                      {member.team_member_role && (
                        <Text size="xs" c="dimmed">
                          Role: {member.team_member_role}
                        </Text>
                      )}
                    </div>
                  </Group>

                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(member)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleRemove(member)}
                      loading={removeMutation.isLoading}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>

                {member.assignment_details && (
                  <>
                    <Divider />
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Assignment Details
                      </Text>

                      {member.assignment_details.role && (
                        <Group gap="xs">
                          <Text size="xs" c="dimmed" w={100}>
                            Role:
                          </Text>
                          <Badge size="sm" variant="light">
                            {member.assignment_details.role}
                          </Badge>
                        </Group>
                      )}

                      {Array.isArray(member.assignment_details.expertise) &&
                        member.assignment_details.expertise.length > 0 && (
                          <Group gap="xs">
                            <Text size="xs" c="dimmed" w={100}>
                              Expertise:
                            </Text>
                            <Group gap="xs">
                              {member.assignment_details.expertise.map(
                                (exp: string) => (
                                  <Badge key={exp} size="sm" variant="dot">
                                    {exp}
                                  </Badge>
                                ),
                              )}
                            </Group>
                          </Group>
                        )}

                      {member.assignment_details.instructions && (
                        <div>
                          <Text size="xs" c="dimmed" mb={4}>
                            Instructions:
                          </Text>
                          <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                            {member.assignment_details.instructions}
                          </Text>
                        </div>
                      )}

                      {member.assignment_details.handling_guidelines && (
                        <div>
                          <Text size="xs" c="dimmed" mb={4}>
                            Handling Guidelines:
                          </Text>
                          <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                            {member.assignment_details.handling_guidelines}
                          </Text>
                        </div>
                      )}
                    </Stack>
                  </>
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <AddCampaignTeamMemberModal
        campaignId={campaignId}
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />

      <EditCampaignTeamMemberModal
        campaignId={campaignId}
        member={selectedMember}
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setSelectedMember(null);
        }}
      />
    </Stack>
  );
};

export default CampaignTeamMembersList;

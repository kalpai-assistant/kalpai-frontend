import React from "react";
import { Switch, Alert, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "react-query";
import { IconAlertCircle } from "@tabler/icons-react";
import { enableTeamAssignment } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface TeamAssignmentToggleProps {
  campaignId: number;
  teamAssignmentEnabled: boolean;
  autoReplyEnabled: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

const TeamAssignmentToggle: React.FC<TeamAssignmentToggleProps> = ({
  campaignId,
  teamAssignmentEnabled,
  autoReplyEnabled,
}) => {
  const queryClient = useQueryClient();

  // ============================================================================
  // Mutations
  // ============================================================================

  const toggleMutation = useMutation(
    (enabled: boolean) => enableTeamAssignment(campaignId, { enabled }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          String(campaignId),
        ]);
      },
      onError: (error: any) => {
        console.error("Failed to toggle team assignment:", error);
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleToggle = async (checked: boolean) => {
    if (checked && autoReplyEnabled) {
      // Don't allow enabling if auto-reply is enabled
      return;
    }
    toggleMutation.mutate(checked);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Stack gap="sm">
      <Switch
        label={
          <div>
            <Text size="sm" fw={500}>
              Enable Team Assignment
            </Text>
            <Text size="xs" c="dimmed">
              Route responses to specific team members using AI
            </Text>
          </div>
        }
        checked={teamAssignmentEnabled}
        onChange={(event) => handleToggle(event.currentTarget.checked)}
        disabled={autoReplyEnabled || toggleMutation.isLoading}
      />

      {autoReplyEnabled && (
        <Alert
          color="blue"
          icon={<IconAlertCircle size={16} />}
          variant="light"
        >
          <Text size="sm">
            Team Assignment and Auto-Reply are mutually exclusive. Disable
            Auto-Reply to enable Team Assignment.
          </Text>
        </Alert>
      )}

      {teamAssignmentEnabled && (
        <Alert
          color="green"
          icon={<IconAlertCircle size={16} />}
          variant="light"
        >
          <Text size="sm">
            Team Assignment is active. Email responses will be intelligently
            routed to assigned team members based on content and expertise.
          </Text>
        </Alert>
      )}
    </Stack>
  );
};

export default TeamAssignmentToggle;

import { Stack, Switch, Text, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "react-query";
import {
  enableTeamAssignment,
  updateAutoReplyConfig,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";
import { notifications } from "@mantine/notifications";

interface CampaignFeatureTogglesProps {
  campaignId: number;
  teamAssignmentEnabled: boolean;
  autoReplyEnabled: boolean;
}

const CampaignFeatureToggles: React.FC<CampaignFeatureTogglesProps> = ({
  campaignId,
  teamAssignmentEnabled,
  autoReplyEnabled,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mutation to enable/disable team assignment
  const teamAssignmentMutation = useMutation(
    (enabled: boolean) => enableTeamAssignment(campaignId, { enabled }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        notifications.show({
          title: "Success",
          message: "Team assignment setting updated",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.detail || "Failed to update team assignment",
          color: "red",
        });
      },
    },
  );

  // Mutation to enable/disable auto-reply
  const autoReplyMutation = useMutation(
    (enabled: boolean) =>
      updateAutoReplyConfig(campaignId, { auto_reply_enabled: enabled }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        notifications.show({
          title: "Success",
          message: "Auto-reply setting updated",
          color: "green",
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.detail || "Failed to update auto-reply",
          color: "red",
        });
      },
    },
  );

  const handleTeamAssignmentToggle = (
    e: React.MouseEvent,
    checked: boolean,
  ) => {
    e.stopPropagation();

    // Scenario 1: Both disabled, enabling team assignment
    if (!teamAssignmentEnabled && !autoReplyEnabled && checked) {
      navigate(`/outreach/email/campaigns/${campaignId}?tab=team-assignment`);
      return;
    }

    // Scenario 2: Team assignment enabled, trying to disable
    if (teamAssignmentEnabled && !checked) {
      modals.openConfirmModal({
        title: "Disable Team Assignment",
        children: (
          <Text size="sm">
            Are you sure you want to disable team assignment for this campaign?
          </Text>
        ),
        labels: { confirm: "Disable", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: () => {
          teamAssignmentMutation.mutate(false);
        },
      });
      return;
    }

    // Scenario 3: Auto-reply enabled, trying to enable team assignment
    if (autoReplyEnabled && checked) {
      modals.openConfirmModal({
        title: "Enable Team Assignment",
        children: (
          <Text size="sm">
            Enabling Team Assignment will disable Auto-Reply. Do you want to
            proceed?
          </Text>
        ),
        labels: { confirm: "Proceed", cancel: "Cancel" },
        confirmProps: { color: "blue" },
        onConfirm: () => {
          // Disable auto-reply first, then navigate
          autoReplyMutation.mutate(false, {
            onSuccess: () => {
              navigate(
                `/outreach/email/campaigns/${campaignId}?tab=team-assignment`,
              );
            },
          });
        },
      });
      return;
    }
  };

  const handleAutoReplyToggle = (e: React.MouseEvent, checked: boolean) => {
    e.stopPropagation();

    // Scenario 1: Both disabled, enabling auto-reply
    if (!teamAssignmentEnabled && !autoReplyEnabled && checked) {
      navigate(`/outreach/email/campaigns/${campaignId}?tab=auto-reply`);
      return;
    }

    // Scenario 2: Auto-reply enabled, trying to disable
    if (autoReplyEnabled && !checked) {
      modals.openConfirmModal({
        title: "Disable Auto-Reply",
        children: (
          <Text size="sm">
            Are you sure you want to disable auto-reply for this campaign?
          </Text>
        ),
        labels: { confirm: "Disable", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: () => {
          autoReplyMutation.mutate(false);
        },
      });
      return;
    }

    // Scenario 3: Team assignment enabled, trying to enable auto-reply
    if (teamAssignmentEnabled && checked) {
      modals.openConfirmModal({
        title: "Enable Auto-Reply",
        children: (
          <Text size="sm">
            Enabling Auto-Reply will disable Team Assignment. Do you want to
            proceed?
          </Text>
        ),
        labels: { confirm: "Proceed", cancel: "Cancel" },
        confirmProps: { color: "blue" },
        onConfirm: () => {
          // Disable team assignment first, then navigate
          teamAssignmentMutation.mutate(false, {
            onSuccess: () => {
              navigate(
                `/outreach/email/campaigns/${campaignId}?tab=auto-reply`,
              );
            },
          });
        },
      });
      return;
    }
  };

  return (
    <Stack gap={4} onClick={(e) => e.stopPropagation()}>
      <Tooltip label="Team Assignment" position="left" withArrow>
        <Switch
          size="xs"
          checked={teamAssignmentEnabled}
          onChange={(e) =>
            handleTeamAssignmentToggle(e as any, e.currentTarget.checked)
          }
          label={
            <Text size="xs" c="dimmed">
              Team
            </Text>
          }
          disabled={
            teamAssignmentMutation.isLoading || autoReplyMutation.isLoading
          }
        />
      </Tooltip>
      <Tooltip label="Auto-Reply" position="left" withArrow>
        <Switch
          size="xs"
          checked={autoReplyEnabled}
          onChange={(e) =>
            handleAutoReplyToggle(e as any, e.currentTarget.checked)
          }
          label={
            <Text size="xs" c="dimmed">
              Auto-Reply
            </Text>
          }
          disabled={
            teamAssignmentMutation.isLoading || autoReplyMutation.isLoading
          }
        />
      </Tooltip>
    </Stack>
  );
};

export default CampaignFeatureToggles;

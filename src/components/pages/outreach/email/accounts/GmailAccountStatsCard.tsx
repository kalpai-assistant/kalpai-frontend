import React, { useState } from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Progress,
  Button,
  NumberInput,
  Modal,
  Alert,
} from "@mantine/core";
import {
  IconRefresh,
  IconSettings,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getGmailAccountStats,
  updateGmailLimits,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

interface GmailAccountStatsCardProps {
  accountId: number;
  gmailAddress: string;
}

const GmailAccountStatsCard: React.FC<GmailAccountStatsCardProps> = ({
  accountId,
  gmailAddress,
}) => {
  const queryClient = useQueryClient();
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState<number>(2000);
  const [error, setError] = useState<string>("");

  const { data: stats, isLoading } = useQuery(
    [EmailOutreachQueryNames.GET_GMAIL_ACCOUNT_STATS, accountId],
    () => getGmailAccountStats(accountId, false),
    {
      onSuccess: (response) => {
        setNewLimit(response.data.max_daily_limit);
      },
      onError: () => {
        setError("Failed to load account stats");
      },
    },
  );

  const refreshMutation = useMutation(
    () => getGmailAccountStats(accountId, true),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_GMAIL_ACCOUNT_STATS,
          accountId,
        ]);
      },
      onError: () => {
        setError("Failed to refresh stats");
      },
    },
  );

  const updateLimitMutation = useMutation(
    () => updateGmailLimits(accountId, { max_daily_limit: newLimit }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_GMAIL_ACCOUNT_STATS,
          accountId,
        ]);
        queryClient.invalidateQueries(
          EmailOutreachQueryNames.GET_GMAIL_ACCOUNTS,
        );
        setLimitModalOpen(false);
        setError("");
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.detail ||
            "Failed to update limit. Please try again.",
        );
      },
    },
  );

  if (isLoading) {
    return (
      <Card withBorder padding="md">
        <Text size="sm" c="dimmed">
          Loading stats...
        </Text>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const accountData = stats.data;
  const usagePercent = Math.round(
    (accountData.daily_sent_count / accountData.max_daily_limit) * 100,
  );

  const getAccountTypeBadge = () => {
    const isWorkspace = accountData.account_type === "workspace";
    return (
      <Badge color={isWorkspace ? "blue" : "gray"} size="sm">
        {isWorkspace ? "Google Workspace" : "Free Gmail"}
      </Badge>
    );
  };

  const getUsageColor = () => {
    if (usagePercent >= 90) return "red";
    if (usagePercent >= 70) return "yellow";
    return "green";
  };

  return (
    <>
      <Card withBorder padding="md">
        <Stack gap="sm">
          <Group justify="space-between">
            <div>
              <Text fw={600} size="sm">
                {gmailAddress}
              </Text>
              <Text size="xs" c="dimmed">
                Daily Sending Capacity
              </Text>
            </div>
            {getAccountTypeBadge()}
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              withCloseButton
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <div>
            <Group justify="space-between" mb={5}>
              <Text size="sm">
                <Text span fw={600}>
                  {accountData.daily_sent_count.toLocaleString()}
                </Text>{" "}
                / {accountData.max_daily_limit.toLocaleString()} sent today
              </Text>
              <Text size="sm" fw={600} c={getUsageColor()}>
                {usagePercent}%
              </Text>
            </Group>
            <Progress value={usagePercent} color={getUsageColor()} size="sm" />
          </div>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              <Text span fw={600} c="green">
                {accountData.available.toLocaleString()}
              </Text>{" "}
              available
            </Text>
            <Text size="xs" c="dimmed">
              Updated:{" "}
              {new Date(accountData.last_synced_at).toLocaleTimeString()}
            </Text>
          </Group>

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={() => refreshMutation.mutate()}
              loading={refreshMutation.isLoading}
            >
              Refresh
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconSettings size={14} />}
              onClick={() => setLimitModalOpen(true)}
            >
              Update Limit
            </Button>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        title="Update Daily Send Limit"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Set the maximum number of emails this account can send per day.
          </Text>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              withCloseButton
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <NumberInput
            label="Daily Send Limit"
            description="Recommended: 500 for Free Gmail, 2000 for Google Workspace"
            placeholder="2000"
            value={newLimit}
            onChange={(value) => setNewLimit(Number(value) || 2000)}
            min={100}
            max={10000}
            step={100}
            required
          />

          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setLimitModalOpen(false)}
              disabled={updateLimitMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconCheck size={16} />}
              onClick={() => updateLimitMutation.mutate()}
              loading={updateLimitMutation.isLoading}
            >
              Update Limit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default GmailAccountStatsCard;

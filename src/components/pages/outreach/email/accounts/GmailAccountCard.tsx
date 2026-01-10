import React from "react";
import {
  Card,
  Text,
  Group,
  Button,
  Badge,
  Progress,
  Stack,
} from "@mantine/core";
import { IconMail, IconTrash, IconRefresh } from "@tabler/icons-react";
import {
  GmailAccount,
  GmailAccountStatus,
} from "../../../../../api/requests_responses/outreach/email";

interface GmailAccountCardProps {
  account: GmailAccount;
  status?: GmailAccountStatus;
  tokenExpiry?: string | null;
  isRefreshing?: boolean;
  onDisconnect: (accountId: number) => void;
  onRefresh: (accountId: number) => void;
}

const GmailAccountCard: React.FC<GmailAccountCardProps> = ({
  account,
  status,
  tokenExpiry,
  isRefreshing = false,
  onDisconnect,
  onRefresh,
}) => {
  const usagePercentage =
    (account.daily_sent_count / account.daily_send_limit) * 100;

  // Determine status badge color and label
  const getStatusBadge = () => {
    if (!status) {
      // Fallback to old is_connected logic if status not available
      return {
        color: account.is_connected ? "green" : "red",
        label: account.is_connected ? "Connected" : "Disconnected",
      };
    }

    switch (status) {
      case "healthy":
        return { color: "green", label: "Healthy" };
      case "expired":
        return { color: "yellow", label: "Expired" };
      case "disconnected":
        return { color: "red", label: "Disconnected" };
      case "needs_reconnect":
        return { color: "orange", label: "Needs Reconnect" };
      default:
        return { color: "gray", label: "Unknown" };
    }
  };

  const statusBadge = getStatusBadge();
  const showRefreshButton = status && status !== "healthy";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Group gap="sm">
          <IconMail size={24} />
          <div>
            <Text fw={500} size="lg">
              {account.gmail_address}
            </Text>
            <Badge color={statusBadge.color} variant="light" mt={4}>
              {statusBadge.label}
            </Badge>
          </div>
        </Group>
        <Group gap="xs">
          {showRefreshButton && (
            <Button
              variant="subtle"
              color="blue"
              leftSection={<IconRefresh size={16} />}
              onClick={() => onRefresh(account.id)}
              loading={isRefreshing}
              size="sm"
            >
              Refresh
            </Button>
          )}
          <Button
            variant="subtle"
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={() => onDisconnect(account.id)}
            size="sm"
          >
            Disconnect
          </Button>
        </Group>
      </Group>

      <Stack gap="xs" mt="md">
        {tokenExpiry && (
          <Text size="xs" c="dimmed">
            Token expires: {new Date(tokenExpiry).toLocaleString()}
          </Text>
        )}

        <Text size="sm" c="dimmed">
          Daily Send Limit
        </Text>
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {account.daily_sent_count} / {account.daily_send_limit}
          </Text>
          <Text size="xs" c="dimmed">
            {usagePercentage.toFixed(1)}% used
          </Text>
        </Group>
        <Progress value={usagePercentage} size="sm" />

        <Text size="xs" c="dimmed" mt="xs">
          Last reset: {new Date(account.last_reset_date).toLocaleDateString()}
        </Text>
      </Stack>
    </Card>
  );
};

export default GmailAccountCard;

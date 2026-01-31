import React from "react";
import { Paper, Text, Group, Stack } from "@mantine/core";
import { IconPhone, IconClock } from "@tabler/icons-react";
import type { ChatSession } from "../../../../../api/requests_responses/outreach/whatsapp";

interface ConversationCardProps {
  session: ChatSession;
  onClick: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  session,
  onClick,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <Paper
      p="md"
      shadow="sm"
      withBorder
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconPhone size={18} />
            <Text fw={600} size="md">
              {session.customer_phone}
            </Text>
          </Group>
          <Group gap={4}>
            <IconClock size={14} color="gray" />
            <Text size="xs" c="dimmed">
              {formatTime(session.updated_time)}
            </Text>
          </Group>
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {session.last_message}
        </Text>

        <Text size="xs" c="dimmed">
          Session ID: {session.session_id}
        </Text>
      </Stack>
    </Paper>
  );
};

export default ConversationCard;

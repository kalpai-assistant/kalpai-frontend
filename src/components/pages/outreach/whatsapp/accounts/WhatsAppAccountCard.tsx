import React from "react";
import { Paper, Text, Badge, Group, Stack, Button } from "@mantine/core";
import { IconPhone, IconCheck } from "@tabler/icons-react";
import type {
  WhatsAppAccount,
  QualityRating,
} from "../../../../../api/requests_responses/outreach/whatsapp";

interface WhatsAppAccountCardProps {
  account: WhatsAppAccount;
  onDisconnect: (accountId: number) => void;
}

const WhatsAppAccountCard: React.FC<WhatsAppAccountCardProps> = ({
  account,
  onDisconnect,
}) => {
  const getQualityColor = (rating: QualityRating): string => {
    switch (rating) {
      case "GREEN":
        return "green";
      case "YELLOW":
        return "yellow";
      case "RED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconPhone size={20} />
            <Text fw={600} size="lg">
              {account.phone_number}
            </Text>
          </Group>
          {account.is_verified && (
            <Badge
              color="blue"
              variant="light"
              leftSection={<IconCheck size={12} />}
            >
              Verified
            </Badge>
          )}
        </Group>

        <Text size="sm" c="dimmed">
          {account.display_name}
        </Text>

        <Group justify="apart" gap="xs">
          <Stack gap={4} style={{ flex: 1 }}>
            <Group gap="xs">
              <Badge
                color={
                  account.status === "ACTIVE"
                    ? "green"
                    : account.status === "PENDING_APPROVAL"
                      ? "yellow"
                      : "red"
                }
              >
                {account.status === "PENDING_APPROVAL"
                  ? "Pending Approval"
                  : account.status}
              </Badge>
              <Badge
                size="sm"
                color={getQualityColor(account.quality_rating)}
                variant="light"
              >
                {account.quality_rating}
              </Badge>
            </Group>
          </Stack>

          <Stack gap={4} style={{ flex: 1 }}>
            <Text size="sm" c="dimmed">
              Provider
            </Text>
            <Badge size="sm" color="blue" variant="light">
              {account.provider === "twilio"
                ? "Platform Managed"
                : "Meta Direct"}
            </Badge>
          </Stack>
        </Group>

        <Badge color="gray" variant="light">
          {account.messaging_tier}
        </Badge>

        <Text size="xs" c="dimmed">
          Status: {account.status}
        </Text>

        <Group justify="space-between" mt="md">
          <Text size="xs" c="dimmed">
            Connected: {new Date(account.created_time).toLocaleDateString()}
          </Text>
          <Button
            size="xs"
            variant="light"
            color="red"
            onClick={() => onDisconnect(account.id)}
          >
            Disconnect
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default WhatsAppAccountCard;

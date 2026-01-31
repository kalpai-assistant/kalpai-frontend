import React from "react";
import {
  Paper,
  Text,
  Badge,
  Group,
  Stack,
  Progress,
  Button,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { IconEye, IconRocket } from "@tabler/icons-react";
import type {
  WhatsAppCampaign,
  CampaignStatus,
} from "../../../../../api/requests_responses/outreach/whatsapp";

interface WhatsAppCampaignCardProps {
  campaign: WhatsAppCampaign;
}

const WhatsAppCampaignCard: React.FC<WhatsAppCampaignCardProps> = ({
  campaign,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: CampaignStatus): string => {
    switch (status) {
      case "running":
        return "blue";
      case "completed":
        return "green";
      case "paused":
        return "yellow";
      case "failed":
        return "red";
      case "scheduled":
        return "grape";
      case "draft":
      default:
        return "gray";
    }
  };

  const progress =
    campaign.total_recipients > 0
      ? (campaign.sent_count / campaign.total_recipients) * 100
      : 0;

  const getDateDisplay = () => {
    if (campaign.status === "scheduled" && campaign.scheduled_at) {
      return `Scheduled: ${new Date(campaign.scheduled_at).toLocaleDateString()} ${new Date(campaign.scheduled_at).toLocaleTimeString()}`;
    }
    return campaign.started_at
      ? `Started: ${new Date(campaign.started_at).toLocaleDateString()}`
      : `Created: ${new Date(campaign.created_time).toLocaleDateString()}`;
  };

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconRocket size={20} />
            <Text fw={600} size="md" lineClamp={1}>
              {campaign.name}
            </Text>
          </Group>
          <Badge color={getStatusColor(campaign.status)} variant="dot">
            {campaign.status.toUpperCase()}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Recipients
            </Text>
            <Text size="sm" fw={500}>
              {campaign.total_recipients}
            </Text>
          </Group>

          <Progress value={progress} size="sm" />

          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Sent: {campaign.sent_count}
            </Text>
            <Text size="xs" c="dimmed">
              Pending: {campaign.pending_count}
            </Text>
          </Group>

          <Group gap="md" mt="xs">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Delivered
              </Text>
              <Text size="sm" fw={500} c="green">
                {campaign.delivered_count}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Read
              </Text>
              <Text size="sm" fw={500} c="blue">
                {campaign.read_count}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Failed
              </Text>
              <Text size="sm" fw={500} c="red">
                {campaign.failed_count}
              </Text>
            </Stack>
          </Group>
        </Stack>

        <Group justify="space-between" mt="md">
          <Text size="xs" c="dimmed">
            {getDateDisplay()}
          </Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconEye size={14} />}
            onClick={() =>
              navigate(`/outreach/whatsapp/campaigns/${campaign.id}`)
            }
          >
            View Details
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default WhatsAppCampaignCard;

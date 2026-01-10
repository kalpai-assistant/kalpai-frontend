import React from "react";
import { Card, Text, Group, Button, Stack, Badge } from "@mantine/core";
import {
  IconMail,
  IconCalendar,
  IconEye,
  IconTrash,
  IconEdit,
  IconClock,
  IconUsers,
} from "@tabler/icons-react";
import {
  Campaign,
  CampaignStatus,
} from "../../../../../api/requests_responses/outreach/email";
import CampaignStatusBadge from "../../shared/CampaignStatusBadge";

interface EmailCampaignCardProps {
  campaign: Campaign;
  onView: (campaignId: number) => void;
  onEdit?: (campaignId: number) => void;
  onDelete: (campaignId: number) => void;
  onStart?: (campaignId: number) => void;
  onPause?: (campaignId: number) => void;
  onResume?: (campaignId: number) => void;
}

const EmailCampaignCard: React.FC<EmailCampaignCardProps> = ({
  campaign,
  onView,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onResume,
}) => {
  const canEdit = campaign.status === CampaignStatus.DRAFT;
  const canStart =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.SCHEDULED;
  const canPause = campaign.status === CampaignStatus.RUNNING;
  const canResume = campaign.status === CampaignStatus.PAUSED;
  const canDelete =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.COMPLETED;

  const successRate =
    campaign.total_recipients > 0
      ? ((campaign.emails_sent / campaign.total_recipients) * 100).toFixed(1)
      : "0";

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={500} size="lg">
            {campaign.name}
          </Text>
          <Group gap="xs" mt={4}>
            <CampaignStatusBadge status={campaign.status} />
            {campaign.sending_schedule?.enabled && (
              <Badge
                color="blue"
                variant="light"
                leftSection={<IconClock size={12} />}
              >
                Scheduled Sending
              </Badge>
            )}
            {campaign.gmail_accounts && campaign.gmail_accounts.length > 0 && (
              <Badge
                color="green"
                variant="light"
                leftSection={<IconUsers size={12} />}
              >
                {campaign.gmail_accounts.length} Sender
                {campaign.gmail_accounts.length > 1 ? "s" : ""}
              </Badge>
            )}
          </Group>
        </div>
      </Group>

      <Stack gap="xs" mt="md">
        <Group gap="md">
          <Group gap={4}>
            <IconMail size={16} />
            <Text size="sm">
              {campaign.emails_sent} / {campaign.total_recipients} sent
            </Text>
          </Group>
          {campaign.emails_failed > 0 && (
            <Text size="sm" c="red">
              {campaign.emails_failed} failed
            </Text>
          )}
          {campaign.emails_bounced > 0 && (
            <Text size="sm" c="orange">
              {campaign.emails_bounced} bounced
            </Text>
          )}
        </Group>

        <Text size="sm" c="dimmed">
          Subject: {campaign.subject_line}
        </Text>

        {campaign.gmail_accounts && campaign.gmail_accounts.length > 0 && (
          <Group gap={4}>
            <IconUsers size={16} />
            <Text size="xs" c="dimmed">
              {campaign.gmail_accounts.length} account
              {campaign.gmail_accounts.length > 1 ? "s" : ""} •{" "}
              {campaign.gmail_accounts
                .reduce((sum, acc) => sum + acc.available, 0)
                .toLocaleString()}{" "}
              /{" "}
              {campaign.gmail_accounts
                .reduce((sum, acc) => sum + acc.daily_limit, 0)
                .toLocaleString()}{" "}
              capacity today
            </Text>
          </Group>
        )}

        {campaign.scheduled_at && (
          <Group gap={4}>
            <IconCalendar size={16} />
            <Text size="xs" c="dimmed">
              Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
            </Text>
          </Group>
        )}

        {campaign.sending_schedule?.enabled && (
          <Group gap={4}>
            <IconClock size={16} />
            <Text size="xs" c="dimmed">
              Sending windows: {campaign.sending_schedule.timezone}
            </Text>
          </Group>
        )}

        {campaign.status === CampaignStatus.RUNNING && (
          <Text size="sm" c="green" fw={500}>
            Success Rate: {successRate}%
          </Text>
        )}
      </Stack>

      <Group gap="xs" mt="md">
        <Button
          variant="light"
          size="sm"
          leftSection={<IconEye size={16} />}
          onClick={() => onView(campaign.id)}
        >
          View
        </Button>
        {canEdit && onEdit && (
          <Button
            variant="light"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(campaign.id)}
          >
            Edit
          </Button>
        )}
        {canStart && onStart && (
          <Button
            variant="light"
            color="green"
            size="sm"
            onClick={() => onStart(campaign.id)}
          >
            Start
          </Button>
        )}
        {canPause && onPause && (
          <Button
            variant="light"
            color="yellow"
            size="sm"
            onClick={() => onPause(campaign.id)}
          >
            Pause
          </Button>
        )}
        {canResume && onResume && (
          <Button
            variant="light"
            color="green"
            size="sm"
            onClick={() => onResume(campaign.id)}
          >
            Resume
          </Button>
        )}
        {canDelete && (
          <Button
            variant="subtle"
            color="red"
            size="sm"
            leftSection={<IconTrash size={16} />}
            onClick={() => onDelete(campaign.id)}
          >
            Delete
          </Button>
        )}
      </Group>
    </Card>
  );
};

export default EmailCampaignCard;

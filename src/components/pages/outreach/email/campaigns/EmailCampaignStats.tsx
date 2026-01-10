import React from "react";
import { Group, Paper, Text, Stack } from "@mantine/core";
import { Campaign } from "../../../../../api/requests_responses/outreach/email";

interface EmailCampaignStatsProps {
  campaign: Campaign;
}

const EmailCampaignStats: React.FC<EmailCampaignStatsProps> = ({
  campaign,
}) => {
  const successRate =
    campaign.total_recipients > 0
      ? ((campaign.emails_sent / campaign.total_recipients) * 100).toFixed(1)
      : "0";

  const stats = [
    {
      label: "Total Recipients",
      value: campaign.total_recipients,
      color: "blue",
    },
    {
      label: "Emails Sent",
      value: campaign.emails_sent,
      color: "green",
    },
    {
      label: "Failed",
      value: campaign.emails_failed,
      color: "red",
    },
    {
      label: "Bounced",
      value: campaign.emails_bounced,
      color: "orange",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      color: "teal",
    },
  ];

  return (
    <Group gap="md">
      {stats.map((stat) => (
        <Paper
          key={stat.label}
          p="md"
          shadow="sm"
          withBorder
          style={{ flex: 1 }}
        >
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              {stat.label}
            </Text>
            <Text size="xl" fw={700} c={stat.color}>
              {stat.value}
            </Text>
          </Stack>
        </Paper>
      ))}
    </Group>
  );
};

export default EmailCampaignStats;

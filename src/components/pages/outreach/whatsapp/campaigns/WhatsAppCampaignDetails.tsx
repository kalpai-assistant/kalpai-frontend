import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Grid,
  Progress,
  Alert,
  Loader,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  IconArrowLeft,
  IconPlayerPause,
  IconPlayerPlay,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  getCampaignStats,
  pauseCampaign,
  startCampaign,
} from "../../../../../api/outreach/whatsapp";
import {
  WhatsAppQueryNames,
  type CampaignStatus,
} from "../../../../../api/requests_responses/outreach/whatsapp";

const WhatsAppCampaignDetails: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch campaign stats
  const {
    data: statsData,
    isLoading,
    error,
  } = useQuery(
    [WhatsAppQueryNames.GET_CAMPAIGN_STATS, campaignId],
    async () => {
      if (!campaignId) return null;
      const response = await getCampaignStats(parseInt(campaignId));
      return response.data;
    },
    {
      enabled: !!campaignId,
      refetchInterval: (data) => {
        // Auto-refresh every 5 seconds if campaign is running
        return data?.status === "running" ? 5000 : false;
      },
    },
  );

  // Pause campaign mutation
  const pauseMutation = useMutation(
    async () => {
      if (!campaignId) return;
      return pauseCampaign(parseInt(campaignId));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          WhatsAppQueryNames.GET_CAMPAIGN_STATS,
          campaignId,
        ]);
      },
    },
  );

  // Resume campaign mutation
  const resumeMutation = useMutation(
    async () => {
      if (!campaignId) return;
      return startCampaign(parseInt(campaignId));
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          WhatsAppQueryNames.GET_CAMPAIGN_STATS,
          campaignId,
        ]);
      },
    },
  );

  if (isLoading) {
    return (
      <Paper p="xl" withBorder>
        <Group justify="center">
          <Loader size="md" />
          <Text c="dimmed">Loading campaign details...</Text>
        </Group>
      </Paper>
    );
  }

  if (error || !statsData) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        variant="light"
      >
        Failed to load campaign details. Please try again.
      </Alert>
    );
  }

  const stats = statsData; // Backend returns direct stats object
  const progress =
    stats.total_recipients > 0
      ? (stats.sent_count / stats.total_recipients) * 100
      : 0;

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
      default:
        return "gray";
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate("/outreach/whatsapp/campaigns")}
          >
            Back to Campaigns
          </Button>
          <div>
            <Title order={3}>{stats.campaign_name}</Title>
            <Badge color={getStatusColor(stats.status)} variant="dot" mt="xs">
              {stats.status.toUpperCase()}
            </Badge>
          </div>
        </Group>

        {stats.status === "running" && (
          <Button
            leftSection={<IconPlayerPause size={18} />}
            onClick={() => pauseMutation.mutate()}
            loading={pauseMutation.isLoading}
            color="yellow"
          >
            Pause Campaign
          </Button>
        )}

        {stats.status === "paused" && (
          <Button
            leftSection={<IconPlayerPlay size={18} />}
            onClick={() => resumeMutation.mutate()}
            loading={resumeMutation.isLoading}
            color="green"
          >
            Resume Campaign
          </Button>
        )}
      </Group>

      {/* Progress Overview */}
      <Paper p="md" withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Campaign Progress
            </Text>
            <Text size="sm" c="dimmed">
              {stats.sent_count} / {stats.total_recipients}
            </Text>
          </Group>
          <Progress value={progress} size="lg" />
          <Text size="xs" c="dimmed">
            {stats.pending_count} messages pending
          </Text>
        </Stack>
      </Paper>

      {/* Stats Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase">
                Total Recipients
              </Text>
              <Text size="xl" fw={700}>
                {stats.total_recipients}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase">
                Sent
              </Text>
              <Text size="xl" fw={700}>
                {stats.sent_count}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.pending_count} pending
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase">
                Delivered
              </Text>
              <Text size="xl" fw={700} c="green">
                {stats.delivered_count}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.delivery_rate.toFixed(1)}% rate
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase">
                Read
              </Text>
              <Text size="xl" fw={700} c="blue">
                {stats.read_count}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.read_rate.toFixed(1)}% rate
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase">
                Failed
              </Text>
              <Text size="xl" fw={700} c="red">
                {stats.failed_count}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {stats.status === "running" && (
        <Alert color="blue" variant="light">
          <Text size="sm">
            This campaign is currently running. Stats are automatically updated
            every 5 seconds.
          </Text>
        </Alert>
      )}
    </Stack>
  );
};

export default WhatsAppCampaignDetails;

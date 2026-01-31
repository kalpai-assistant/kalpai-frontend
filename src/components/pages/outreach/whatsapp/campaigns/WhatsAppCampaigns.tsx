import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  SegmentedControl,
  Text,
  Grid,
} from "@mantine/core";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { IconAlertCircle, IconPlus, IconRocket } from "@tabler/icons-react";
import { getCampaigns } from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";
import WhatsAppCampaignCard from "./WhatsAppCampaignCard";

const WhatsAppCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch campaigns
  const {
    data: campaignsData,
    isLoading,
    error,
  } = useQuery(WhatsAppQueryNames.GET_CAMPAIGNS, async () => {
    const response = await getCampaigns();
    return response.data;
  });

  const campaigns = campaignsData?.campaigns || [];

  // Filter campaigns based on status
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (statusFilter === "all") return true;
    return campaign.status === statusFilter;
  });

  return (
    <Stack gap="md">
      <>
        <Group justify="space-between">
          <Title order={3}>WhatsApp Campaigns</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => navigate("/outreach/whatsapp/campaigns/create")}
            color="green"
          >
            Create Campaign
          </Button>
        </Group>

        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: "all", label: "All" },
            { value: "draft", label: "Draft" },
            { value: "scheduled", label: "Scheduled" },
            { value: "running", label: "Running" },
            { value: "completed", label: "Completed" },
            { value: "paused", label: "Paused" },
          ]}
        />

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            Failed to load campaigns. Please try again.
          </Alert>
        )}

        {isLoading ? (
          <Paper p="xl" withBorder>
            <Group justify="center">
              <Loader size="md" />
              <Text c="dimmed">Loading campaigns...</Text>
            </Group>
          </Paper>
        ) : filteredCampaigns.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <IconRocket size={48} color="gray" />
              <Text size="lg" fw={500} c="dimmed">
                {statusFilter === "all"
                  ? "No Campaigns Found"
                  : `No ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Campaigns`}
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Create your first WhatsApp campaign to reach your audience.
              </Text>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => navigate("/outreach/whatsapp/campaigns/create")}
                color="green"
                size="md"
              >
                Create Campaign
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid>
            {filteredCampaigns.map((campaign) => (
              <Grid.Col key={campaign.id} span={{ base: 12, md: 6, lg: 4 }}>
                <WhatsAppCampaignCard campaign={campaign} />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </>
    </Stack>
  );
};

export default WhatsAppCampaigns;

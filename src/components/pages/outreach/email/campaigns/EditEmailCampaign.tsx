import React, { useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Group,
  Alert,
  Loader,
  Text,
} from "@mantine/core";
import { useQuery } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import { IconX, IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { getCampaign } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

/**
 * @deprecated This component is deprecated. Campaign editing is now done
 * through the "Content" tab in the Campaign Details page, which supports
 * both template and automation modes with better UX.
 *
 * This component will redirect users to the new editing interface.
 */
const EditEmailCampaign: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();

  const { isLoading: isLoadingCampaign, error: campaignError } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGN, campaignId],
    () => getCampaign(Number(campaignId!)),
    {
      enabled: !!campaignId,
      refetchOnWindowFocus: false,
    },
  );

  // Auto-redirect to the Content tab in details page
  useEffect(() => {
    if (campaignId && !isLoadingCampaign && !campaignError) {
      const timer = setTimeout(() => {
        navigate(`/outreach/email/campaigns/${campaignId}?tab=content`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [campaignId, isLoadingCampaign, campaignError, navigate]);

  if (isLoadingCampaign) {
    return (
      <Paper p="md" shadow="sm" withBorder>
        <Group justify="center" p="xl">
          <Loader />
          <Text>Loading campaign...</Text>
        </Group>
      </Paper>
    );
  }

  if (campaignError) {
    return (
      <Alert icon={<IconX size={16} />} title="Error" color="red">
        Failed to load campaign. Please try again.
      </Alert>
    );
  }

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Campaign Editing Has Moved!</Title>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/outreach/email/campaigns")}
          >
            Back to Campaigns
          </Button>
        </Group>

        <Alert
          icon={<IconAlertCircle size={20} />}
          title="New Location"
          color="blue"
          variant="filled"
        >
          <Stack gap="sm">
            <Text size="sm">
              Campaign editing has been moved to a better location with more
              features!
            </Text>
            <Text size="sm">
              You can now edit campaign content (including switching between
              Template and Automation modes) directly from the{" "}
              <strong>Content tab</strong> in the Campaign Details page.
            </Text>
            <Text size="sm" fw={600}>
              Redirecting you automatically in 2 seconds...
            </Text>
          </Stack>
        </Alert>

        <Button
          size="lg"
          onClick={() =>
            navigate(`/outreach/email/campaigns/${campaignId}?tab=content`)
          }
        >
          Go to Campaign Content Editor
        </Button>
      </Stack>
    </Paper>
  );
};

export default EditEmailCampaign;

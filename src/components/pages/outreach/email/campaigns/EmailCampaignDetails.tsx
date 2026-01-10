import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Loader,
  Alert,
  Tabs,
  Group,
  Text,
  Table,
  Pagination,
  Badge,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconPlayCard,
  IconEyePause,
} from "@tabler/icons-react";
import {
  getCampaign,
  startCampaign,
  pauseCampaign,
  deleteCampaign,
  getSentEmails,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignStatus,
  SentEmail,
} from "../../../../../api/requests_responses/outreach/email";
import { PageSizes } from "../../../../../utils/constants";
import CampaignStatusBadge from "../../shared/CampaignStatusBadge";
import EmailCampaignStats from "./EmailCampaignStats";
import SendingScheduleForm from "./SendingScheduleForm";
import CampaignSenderAccounts from "./CampaignSenderAccounts";
import CampaignEmailsList from "./CampaignEmailsList";
import AddCampaignEmails from "./AddCampaignEmails";
import AutoReplySettings from "./AutoReplySettings";
import EmailThreadModal from "./EmailThreadModal";
import UpdateCampaignContent from "./UpdateCampaignContent";
import TeamAssignmentToggle from "./TeamAssignmentToggle";
import CampaignTeamMembersList from "./CampaignTeamMembersList";
import AssignmentsReport from "./AssignmentsReport";

const EmailCampaignDetails: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("content");
  const [sentEmailsPage, setSentEmailsPage] = useState(1);
  const [addEmailsModalOpened, setAddEmailsModalOpened] = useState(false);
  const [selectedSentEmail, setSelectedSentEmail] = useState<SentEmail | null>(
    null,
  );
  const [threadModalOpened, setThreadModalOpened] = useState(false);

  // Handle tab query parameter for redirects
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Polling for running campaigns
  const {
    data: campaignResponse,
    isLoading,
    error,
    // refetch: refetchCampaign,
  } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGN, campaignId],
    () => getCampaign(Number(campaignId!)),
    {
      enabled: !!campaignId,
      refetchOnWindowFocus: false,
      refetchInterval: (data) => {
        // Poll every 5 seconds if campaign is running
        return data?.data?.status === CampaignStatus.RUNNING ? 5000 : false;
      },
    },
  );

  const { data: sentEmailsResponse } = useQuery(
    [EmailOutreachQueryNames.GET_SENT_EMAILS, campaignId, sentEmailsPage],
    () =>
      getSentEmails(Number(campaignId!), {
        page: sentEmailsPage,
        limit: PageSizes.CHAT_HISTORY,
      }),
    {
      enabled: !!campaignId,
      refetchOnWindowFocus: false,
    },
  );

  const startMutation = useMutation(() => startCampaign(Number(campaignId!)), {
    onSuccess: () => {
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
    },
  });

  const pauseMutation = useMutation(() => pauseCampaign(Number(campaignId!)), {
    onSuccess: () => {
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
    },
  });

  const resumeMutation = useMutation(() => startCampaign(Number(campaignId!)), {
    onSuccess: () => {
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
    },
  });

  const deleteMutation = useMutation(
    () => deleteCampaign(Number(campaignId!)),
    {
      onSuccess: () => {
        navigate("/outreach/email/campaigns");
      },
    },
  );

  const campaign = campaignResponse?.data;

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  if (error || !campaign) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Failed to load campaign details. Please try again.
      </Alert>
    );
  }

  const canEdit = campaign.status === CampaignStatus.DRAFT;
  const canStart =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.SCHEDULED;
  const canPause = campaign.status === CampaignStatus.RUNNING;
  const canResume = campaign.status === CampaignStatus.PAUSED;
  const canDelete =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.COMPLETED;

  const handleSentEmailClick = (sentEmail: SentEmail) => {
    setSelectedSentEmail(sentEmail);
    setThreadModalOpened(true);
  };

  const sentEmails = sentEmailsResponse?.data?.sent_emails || [];
  const totalSentEmails = sentEmailsResponse?.data?.total || 0;
  const totalSentEmailsPages = Math.ceil(
    totalSentEmails / PageSizes.CHAT_HISTORY,
  );

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/outreach/email/campaigns")}
        >
          Back to Campaigns
        </Button>
      </Group>

      <Paper p="md" shadow="sm" withBorder>
        <Stack gap="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Title order={3}>{campaign.name}</Title>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <Group>
              {canEdit && (
                <Button
                  variant="light"
                  leftSection={<IconEdit size={16} />}
                  onClick={() =>
                    navigate(`/outreach/email/campaigns/${campaignId}/edit`)
                  }
                >
                  Edit
                </Button>
              )}
              {canStart && (
                <Button
                  color="green"
                  leftSection={<IconPlayCard size={16} />}
                  onClick={() => startMutation.mutate()}
                  loading={startMutation.isLoading}
                >
                  Start Campaign
                </Button>
              )}
              {canPause && (
                <Button
                  color="yellow"
                  leftSection={<IconEyePause size={16} />}
                  onClick={() => pauseMutation.mutate()}
                  loading={pauseMutation.isLoading}
                >
                  Pause
                </Button>
              )}
              {canResume && (
                <Button
                  color="green"
                  leftSection={<IconPlayCard size={16} />}
                  onClick={() => resumeMutation.mutate()}
                  loading={resumeMutation.isLoading}
                >
                  Resume
                </Button>
              )}
              {canDelete && (
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => deleteMutation.mutate()}
                  loading={deleteMutation.isLoading}
                >
                  Delete
                </Button>
              )}
            </Group>
          </Group>

          {campaign.status === CampaignStatus.RUNNING && (
            <Alert color="blue">
              Campaign is running. Stats are updating in real-time...
            </Alert>
          )}

          <EmailCampaignStats campaign={campaign} />

          <Tabs
            value={activeTab}
            onChange={(value) => setActiveTab(value || "content")}
          >
            <Tabs.List>
              {/* <Tabs.Tab value="overview">Overview</Tabs.Tab> */}
              <Tabs.Tab value="content">Content</Tabs.Tab>
              <Tabs.Tab value="team-assignment">Team Assignment</Tabs.Tab>
              <Tabs.Tab value="auto-reply">Auto-Reply</Tabs.Tab>
              <Tabs.Tab value="emails">Campaign Emails</Tabs.Tab>
              <Tabs.Tab value="sent-emails">Sent Emails</Tabs.Tab>
              <Tabs.Tab value="schedule">Sending Schedule</Tabs.Tab>
              <Tabs.Tab value="senders">Sender Accounts</Tabs.Tab>
            </Tabs.List>

            {/* <Tabs.Panel value="overview" pt="md">
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={500} mb="xs">
                    Subject Line
                  </Text>
                  <Text>{campaign.subject_line}</Text>
                </div>

                {campaign.email_template && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Email Template
                    </Text>
                    <Paper p="md" withBorder>
                      <Text style={{ whiteSpace: "pre-wrap" }}>
                        {campaign.email_template}
                      </Text>
                    </Paper>
                  </div>
                )}

                {campaign.ai_flavor && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      AI Flavor
                    </Text>
                    <Badge>{campaign.ai_flavor}</Badge>
                  </div>
                )}

                <Group>
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Created
                    </Text>
                    <Text size="sm" c="dimmed">
                      {new Date(campaign.created_time).toLocaleString()}
                    </Text>
                  </div>
                  {campaign.started_at && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Started
                      </Text>
                      <Text size="sm" c="dimmed">
                        {new Date(campaign.started_at).toLocaleString()}
                      </Text>
                    </div>
                  )}
                  {campaign.completed_at && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Completed
                      </Text>
                      <Text size="sm" c="dimmed">
                        {new Date(campaign.completed_at).toLocaleString()}
                      </Text>
                    </div>
                  )}
                  {campaign.scheduled_at && (
                    <div>
                      <Text size="sm" fw={500} mb="xs">
                        Scheduled
                      </Text>
                      <Text size="sm" c="dimmed">
                        {new Date(campaign.scheduled_at).toLocaleString()}
                      </Text>
                    </div>
                  )}
                </Group>
              </Stack>
            </Tabs.Panel> */}

            <Tabs.Panel value="content" pt="md">
              <UpdateCampaignContent campaign={campaign} />
            </Tabs.Panel>

            <Tabs.Panel value="emails" pt="md">
              <CampaignEmailsList
                campaignId={Number(campaignId!)}
                onAddEmailsClick={() => setAddEmailsModalOpened(true)}
              />
            </Tabs.Panel>

            <Tabs.Panel value="sent-emails" pt="md">
              <Stack gap="md">
                {sentEmails.length === 0 ? (
                  <Text ta="center" c="dimmed" py="xl">
                    No emails sent yet
                  </Text>
                ) : (
                  <>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Recipient</Table.Th>
                          <Table.Th>Subject</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Sent At</Table.Th>
                          <Table.Th>Opened</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {sentEmails.map((email) => (
                          <Table.Tr
                            key={email.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSentEmailClick(email)}
                          >
                            <Table.Td>{email.recipient_email}</Table.Td>
                            <Table.Td>{email.subject}</Table.Td>
                            <Table.Td>
                              <Badge
                                color={
                                  email.status === "sent"
                                    ? "green"
                                    : email.status === "failed"
                                    ? "red"
                                    : email.status === "bounced"
                                    ? "orange"
                                    : "gray"
                                }
                                variant="light"
                              >
                                {email.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              {email.sent_at
                                ? new Date(email.sent_at).toLocaleString()
                                : "-"}
                            </Table.Td>
                            <Table.Td>
                              {email.opened_at
                                ? new Date(email.opened_at).toLocaleString()
                                : "Not opened"}
                            </Table.Td>
                            <Table.Td>
                              {email.has_response && (
                                <Badge color="blue" variant="filled" size="sm">
                                  Has Response
                                </Badge>
                              )}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>

                    {totalSentEmailsPages > 1 && (
                      <Pagination
                        total={totalSentEmailsPages}
                        value={sentEmailsPage}
                        onChange={setSentEmailsPage}
                        mt="md"
                      />
                    )}
                  </>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="team-assignment" pt="md">
              <Stack gap="lg">
                <TeamAssignmentToggle
                  campaignId={Number(campaignId!)}
                  teamAssignmentEnabled={
                    campaign.team_assignment_enabled || false
                  }
                  autoReplyEnabled={campaign.auto_reply_enabled || false}
                />
                {campaign.team_assignment_enabled && (
                  <>
                    <CampaignTeamMembersList
                      campaignId={Number(campaignId!)}
                      teamAssignmentEnabled={campaign.team_assignment_enabled}
                    />
                    <AssignmentsReport campaignId={Number(campaignId!)} />
                  </>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="auto-reply" pt="md">
              <AutoReplySettings
                campaignId={Number(campaignId!)}
                teamAssignmentEnabled={
                  campaign.team_assignment_enabled || false
                }
              />
            </Tabs.Panel>

            <Tabs.Panel value="schedule" pt="md">
              <SendingScheduleForm campaignId={Number(campaignId!)} />
            </Tabs.Panel>

            <Tabs.Panel value="senders" pt="md">
              <CampaignSenderAccounts
                campaignId={Number(campaignId!)}
                isCreationMode={false}
              />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>

      {/* Add Emails Modal */}
      <AddCampaignEmails
        campaignId={Number(campaignId!)}
        opened={addEmailsModalOpened}
        onClose={() => setAddEmailsModalOpened(false)}
      />

      {/* Email Thread Modal */}
      <EmailThreadModal
        sentEmail={selectedSentEmail}
        opened={threadModalOpened}
        onClose={() => {
          setThreadModalOpened(false);
          setSelectedSentEmail(null);
        }}
      />
    </Stack>
  );
};

export default EmailCampaignDetails;

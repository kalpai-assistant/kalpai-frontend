import React, { useState, useRef, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Modal,
  Text,
  Select,
  Box,
  ActionIcon,
  Divider,
  Badge,
  Tooltip,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconPlus,
  IconAlertCircle,
  IconMail,
  IconTrash,
  IconClock,
  IconUsers,
  IconPlayerPlay,
  IconPlayerPause,
  IconFileText,
  IconSparkles,
} from "@tabler/icons-react";
import {
  getCampaigns,
  startCampaign,
  pauseCampaign,
  deleteCampaign,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignStatus,
  Campaign,
} from "../../../../../api/requests_responses/outreach/email";
import CampaignStatusBadge from "../../shared/CampaignStatusBadge";
import EmailListAssociationsPopover from "./EmailListAssociationsPopover";
import CampaignFeatureToggles from "./CampaignFeatureToggles";
import styles from "./EmailCampaigns.module.scss";

const EmailCampaigns: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [campaignToAction, setCampaignToAction] = useState<{
    id: number;
    action: "start" | "pause" | "resume" | "delete";
  } | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [containerBounds, setContainerBounds] = useState({ left: 0, width: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: campaignsResponse,
    isLoading,
    error,
  } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGNS, statusFilter],
    () => getCampaigns(statusFilter ? { status: statusFilter } : undefined),
    {
      refetchOnWindowFocus: false,
    },
  );

  const startMutation = useMutation(
    (campaignId: number) => startCampaign(campaignId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
        setActionModalOpen(false);
        setCampaignToAction(null);
      },
    },
  );

  const pauseMutation = useMutation(
    (campaignId: number) => pauseCampaign(campaignId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
        setActionModalOpen(false);
        setCampaignToAction(null);
      },
    },
  );

  const resumeMutation = useMutation(
    (campaignId: number) => startCampaign(campaignId), // Resume uses the same endpoint as start
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGN);
        setActionModalOpen(false);
        setCampaignToAction(null);
      },
    },
  );

  const deleteMutation = useMutation(
    (campaignId: number) => deleteCampaign(campaignId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        setDeleteModalOpen(false);
        setCampaignToAction(null);
      },
    },
  );

  useEffect(() => {
    if (headerRef.current && containerRef.current) {
      const height = headerRef.current.offsetHeight;
      const rect = containerRef.current.getBoundingClientRect();
      setHeaderHeight(height);
      setContainerBounds({ left: rect.left, width: rect.width });
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`,
      );
    }
  }, [campaignsResponse]);

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        if (headerRef.current && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const shouldBeSticky = containerRect.top < 0;

          setIsSticky(shouldBeSticky);

          // Update container bounds when becoming sticky
          if (shouldBeSticky) {
            setContainerBounds({
              left: containerRect.left,
              width: containerRect.width,
            });
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCreateClick = () => {
    navigate("/outreach/email/campaigns/create");
  };

  const handleViewClick = (campaignId: number) => {
    navigate(`/outreach/email/campaigns/${campaignId}`);
  };

  const handleEditClick = (campaignId: number) => {
    navigate(`/outreach/email/campaigns/${campaignId}/edit`);
  };

  const handleStartClick = (campaignId: number) => {
    setCampaignToAction({ id: campaignId, action: "start" });
    setActionModalOpen(true);
  };

  const handlePauseClick = (campaignId: number) => {
    setCampaignToAction({ id: campaignId, action: "pause" });
    setActionModalOpen(true);
  };

  const handleResumeClick = (campaignId: number) => {
    setCampaignToAction({ id: campaignId, action: "resume" });
    setActionModalOpen(true);
  };

  const handleDeleteClick = (campaignId: number) => {
    setCampaignToAction({ id: campaignId, action: "delete" });
    setDeleteModalOpen(true);
  };

  const handleActionConfirm = () => {
    if (!campaignToAction) return;

    if (campaignToAction.action === "start") {
      startMutation.mutate(campaignToAction.id);
    } else if (campaignToAction.action === "pause") {
      pauseMutation.mutate(campaignToAction.id);
    } else if (campaignToAction.action === "resume") {
      resumeMutation.mutate(campaignToAction.id);
    }
  };

  const handleDeleteConfirm = () => {
    if (campaignToAction?.action === "delete") {
      deleteMutation.mutate(campaignToAction.id);
    }
  };

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Failed to load campaigns. Please try again.
      </Alert>
    );
  }

  const campaigns = campaignsResponse?.data?.campaigns || [];

  return (
    <>
      <Box
        className={`${styles.container} ${isSticky ? styles.stickyActive : ""}`}
        ref={containerRef}
      >
        <Box
          ref={headerRef}
          className={`${styles.header} ${isSticky ? styles.sticky : ""}`}
          style={
            isSticky
              ? {
                  left: containerBounds.left,
                  width: containerBounds.width,
                }
              : undefined
          }
        >
          <Group justify="space-between" align="center" p="md">
            <Title order={3}>Email Campaigns</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateClick}
            >
              Create Campaign
            </Button>
          </Group>

          <Box px="md" pb="md">
            <Select
              placeholder="Filter by status"
              data={[
                { value: "", label: "All" },
                { value: CampaignStatus.DRAFT, label: "Draft" },
                { value: CampaignStatus.SCHEDULED, label: "Scheduled" },
                { value: CampaignStatus.RUNNING, label: "Running" },
                { value: CampaignStatus.PAUSED, label: "Paused" },
                { value: CampaignStatus.COMPLETED, label: "Completed" },
                { value: CampaignStatus.FAILED, label: "Failed" },
              ]}
              value={statusFilter || ""}
              onChange={(value) => setStatusFilter(value || null)}
              clearable
            />
          </Box>

          {campaigns.length > 0 && (
            <>
              <Divider />
              <Box className={styles.listHeader} px="md" py="xs">
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 2.5 }}>
                    Campaign
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Status
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Progress
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Features
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 0.8 }}>
                    Type
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 0.8 }}>
                    Recipients
                  </Text>
                </Group>
              </Box>
            </>
          )}
        </Box>

        <Box
          className={styles.listContainer}
          style={
            isSticky
              ? {
                  top: `${headerHeight}px`,
                  height: `calc(100vh - ${headerHeight}px)`,
                  maxHeight: `calc(100vh - ${headerHeight}px)`,
                }
              : undefined
          }
        >
          {campaigns.length === 0 ? (
            <Paper p="xl" shadow="sm" withBorder m="md">
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed" ta="center">
                  No campaigns yet
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Create your first email campaign to start reaching out to
                  contacts
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreateClick}
                >
                  Create Your First Campaign
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Stack gap={0}>
              {campaigns.map((campaign, index) => (
                <EmailCampaignListItem
                  key={campaign.id}
                  campaign={campaign}
                  onView={handleViewClick}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStart={handleStartClick}
                  onPause={handlePauseClick}
                  onResume={handleResumeClick}
                  isLast={index === campaigns.length - 1}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Modal
        opened={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={
          campaignToAction?.action === "start"
            ? "Start Campaign"
            : campaignToAction?.action === "pause"
            ? "Pause Campaign"
            : "Resume Campaign"
        }
      >
        <Text mb="md">
          Are you sure you want to {campaignToAction?.action} this campaign?
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setActionModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color={campaignToAction?.action === "pause" ? "yellow" : "green"}
            onClick={handleActionConfirm}
            loading={
              startMutation.isLoading ||
              pauseMutation.isLoading ||
              resumeMutation.isLoading
            }
          >
            {campaignToAction?.action === "start"
              ? "Start"
              : campaignToAction?.action === "pause"
              ? "Pause"
              : "Resume"}
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Campaign"
      >
        <Text mb="md">
          Are you sure you want to delete this campaign? This action cannot be
          undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteConfirm}
            loading={deleteMutation.isLoading}
          >
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};

interface EmailCampaignListItemProps {
  campaign: Campaign;
  onView: (campaignId: number) => void;
  onEdit?: (campaignId: number) => void;
  onDelete: (campaignId: number) => void;
  onStart?: (campaignId: number) => void;
  onPause?: (campaignId: number) => void;
  onResume?: (campaignId: number) => void;
  isLast: boolean;
}

const EmailCampaignListItem: React.FC<EmailCampaignListItemProps> = ({
  campaign,
  onView,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onResume,
  isLast,
}) => {
  const canStart =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.SCHEDULED;
  const canPause = campaign.status === CampaignStatus.RUNNING;
  const canResume = campaign.status === CampaignStatus.PAUSED;

  const successRate =
    campaign.total_recipients > 0
      ? ((campaign.emails_sent / campaign.total_recipients) * 100).toFixed(1)
      : "0";

  const handleRowClick = () => {
    onView(campaign.id);
  };

  return (
    <Paper
      className={styles.listItem}
      p="md"
      withBorder
      style={{
        borderBottom: isLast ? "1px solid" : "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      }}
      onClick={handleRowClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--mantine-color-gray-0)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        {/* Column 1: Campaign (Name + Subject + Status Badges + Controls) */}
        <Box style={{ flex: 2.5 }}>
          <Text fw={500} size="md" mb={4}>
            {campaign.name}
          </Text>
          <Tooltip
            label={campaign.subject_line}
            position="bottom-start"
            withArrow
          >
            <Text
              size="sm"
              c="dimmed"
              mb={8}
              lineClamp={1}
              style={{ cursor: "help" }}
            >
              Subject: {campaign.subject_line}
            </Text>
          </Tooltip>
          <Group gap="xs" wrap="wrap">
            <CampaignStatusBadge status={campaign.status} />
            {campaign.sending_schedule?.enabled && (
              <Badge
                color="blue"
                variant="light"
                size="sm"
                leftSection={<IconClock size={12} />}
              >
                Scheduled
              </Badge>
            )}
            {campaign.gmail_accounts && campaign.gmail_accounts.length > 0 && (
              <Badge
                color="green"
                variant="light"
                size="sm"
                leftSection={<IconUsers size={12} />}
              >
                {campaign.gmail_accounts.length} Sender
                {campaign.gmail_accounts.length > 1 ? "s" : ""}
              </Badge>
            )}

            {/* Play/Pause/Delete Controls */}
            <Group gap={4} ml="auto">
              {canStart && onStart && (
                <Tooltip label="Start Campaign" withArrow>
                  <ActionIcon
                    variant="light"
                    color="green"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart(campaign.id);
                    }}
                  >
                    <IconPlayerPlay size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              {canPause && onPause && (
                <Tooltip label="Pause Campaign" withArrow>
                  <ActionIcon
                    variant="light"
                    color="yellow"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPause(campaign.id);
                    }}
                  >
                    <IconPlayerPause size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              {canResume && onResume && (
                <Tooltip label="Resume Campaign" withArrow>
                  <ActionIcon
                    variant="light"
                    color="green"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onResume(campaign.id);
                    }}
                  >
                    <IconPlayerPlay size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Delete Campaign" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(campaign.id);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Box>

        {/* Column 2: Status (existing status info) */}
        <Stack gap={4} style={{ flex: 1 }}>
          {campaign.gmail_accounts && campaign.gmail_accounts.length > 0 && (
            <Group gap={4} wrap="nowrap">
              <IconUsers size={14} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {campaign.gmail_accounts
                  .reduce((sum, acc) => sum + acc.available, 0)
                  .toLocaleString()}{" "}
                /{" "}
                {campaign.gmail_accounts
                  .reduce((sum, acc) => sum + acc.daily_limit, 0)
                  .toLocaleString()}{" "}
                capacity
              </Text>
            </Group>
          )}
          {campaign.status === CampaignStatus.RUNNING && (
            <Text size="sm" c="green" fw={500}>
              {successRate}% success
            </Text>
          )}
        </Stack>

        {/* Column 3: Progress */}
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap={4} wrap="nowrap">
            <IconMail size={14} />
            <Text size="sm">
              {campaign.emails_sent} / {campaign.total_recipients}
            </Text>
          </Group>
          {campaign.emails_failed > 0 && (
            <Text size="xs" c="red">
              {campaign.emails_failed} failed
            </Text>
          )}
          {campaign.emails_bounced > 0 && (
            <Text size="xs" c="orange">
              {campaign.emails_bounced} bounced
            </Text>
          )}
        </Stack>

        {/* Column 4: Features (Team Assignment & Auto-Reply toggles) */}
        <Box style={{ flex: 1 }}>
          <CampaignFeatureToggles
            campaignId={campaign.id}
            teamAssignmentEnabled={campaign.team_assignment_enabled || false}
            autoReplyEnabled={campaign.auto_reply_enabled || false}
          />
        </Box>

        {/* Column 5: Type (Template vs AI) */}
        <Box style={{ flex: 0.8 }}>
          {campaign.ai_flavor ? (
            <Group gap={4} wrap="nowrap">
              <IconSparkles
                size={16}
                style={{ color: "var(--mantine-color-violet-6)" }}
              />
              <Text size="sm" style={{ textTransform: "capitalize" }}>
                {campaign.ai_flavor}
              </Text>
            </Group>
          ) : (
            <Group gap={4} wrap="nowrap">
              <IconFileText
                size={16}
                style={{ color: "var(--mantine-color-blue-6)" }}
              />
              <Text size="sm">Template</Text>
            </Group>
          )}
        </Box>

        {/* Column 6: Recipients (with email list associations popover) */}
        <Box style={{ flex: 0.8 }}>
          <EmailListAssociationsPopover
            associations={campaign.email_list_associations || []}
            totalRecipients={campaign.total_recipients}
          />
        </Box>
      </Group>
    </Paper>
  );
};

export default EmailCampaigns;

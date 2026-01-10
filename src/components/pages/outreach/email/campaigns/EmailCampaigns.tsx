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
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconPlus,
  IconAlertCircle,
  IconMail,
  IconCalendar,
  IconEye,
  IconTrash,
  IconEdit,
  IconClock,
  IconUsers,
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
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 2 }}>
                    Campaign Name
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Status & Info
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Progress
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Schedule
                  </Text>
                  <Box
                    style={{
                      flex: 1.5,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text fw={600} size="sm" c="dimmed">
                      Actions
                    </Text>
                  </Box>
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
    <Paper
      className={styles.listItem}
      p="md"
      withBorder
      style={{ borderBottom: isLast ? "1px solid" : "none" }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box style={{ flex: 2 }}>
          <Text fw={500} size="md" mb={4}>
            {campaign.name}
          </Text>
          <Text size="sm" c="dimmed" mb={8} lineClamp={1}>
            Subject: {campaign.subject_line}
          </Text>
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
          </Group>
        </Box>

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

        <Stack gap={4} style={{ flex: 1 }}>
          {campaign.scheduled_at && (
            <Group gap={4} wrap="nowrap">
              <IconCalendar size={14} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {new Date(campaign.scheduled_at).toLocaleDateString()}
              </Text>
            </Group>
          )}
          {campaign.sending_schedule?.enabled && (
            <Group gap={4} wrap="nowrap">
              <IconClock size={14} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {campaign.sending_schedule.timezone}
              </Text>
            </Group>
          )}
        </Stack>

        <Group gap="xs" style={{ flex: 1.5 }} justify="flex-end" wrap="nowrap">
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
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              onClick={() => onDelete(campaign.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>
    </Paper>
  );
};

export default EmailCampaigns;

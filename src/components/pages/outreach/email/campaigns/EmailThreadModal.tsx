import React from "react";
import {
  Modal,
  Stack,
  Text,
  Badge,
  Divider,
  Paper,
  Group,
  Loader,
  Alert,
  ScrollArea,
} from "@mantine/core";
import {
  IconMail,
  IconRobot,
  IconAlertCircle,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "react-query";
import { getEmailResponses } from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  SentEmail,
  Sentiment,
} from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface EmailThreadModalProps {
  sentEmail: SentEmail | null;
  opened: boolean;
  onClose: () => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

const getSentimentColor = (sentiment: Sentiment): string => {
  const colorMap: Record<Sentiment, string> = {
    [Sentiment.INTERESTED]: "green",
    [Sentiment.NOT_INTERESTED]: "red",
    [Sentiment.NEUTRAL]: "gray",
  };
  return colorMap[sentiment];
};

const getAutoReplyStatusIcon = (status: string) => {
  switch (status) {
    case "sent":
      return "✓";
    case "pending":
      return "⏳";
    case "failed":
      return "❌";
    default:
      return "";
  }
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
};

// ============================================================================
// Main Component
// ============================================================================

const EmailThreadModal: React.FC<EmailThreadModalProps> = ({
  sentEmail,
  opened,
  onClose,
}) => {
  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: responsesData, isLoading } = useQuery(
    [EmailOutreachQueryNames.GET_EMAIL_RESPONSES, sentEmail?.id],
    () => getEmailResponses(sentEmail!.id),
    {
      enabled: !!sentEmail && opened,
      refetchOnWindowFocus: false,
    },
  );

  const responses = responsesData?.data?.responses || [];

  // ============================================================================
  // Render
  // ============================================================================

  if (!sentEmail) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconMail size={20} />
          <Text fw={600}>Email Thread</Text>
        </Group>
      }
      size="xl"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <ScrollArea.Autosize mah="70vh" type="auto" offsetScrollbars>
        <Stack gap="md" pb="xs">
          {/* Original Sent Email */}
          <Paper p="md" withBorder style={{ backgroundColor: "#e7f5ff" }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text size="sm" fw={600}>
                    You
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  {sentEmail.sent_at
                    ? formatDateTime(sentEmail.sent_at)
                    : "Unknown"}
                </Text>
              </Group>

              <Text size="sm" fw={600}>
                To: {sentEmail.recipient_email}
              </Text>
              <Text size="sm" fw={500}>
                Subject: {sentEmail.subject}
              </Text>

              <Divider />

              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {sentEmail.body}
              </Text>

              <Group gap="xs" mt="xs">
                <Badge size="sm" variant="light" color="blue">
                  {sentEmail.status}
                </Badge>
                {sentEmail.opened_at && (
                  <Badge size="sm" variant="light" color="green">
                    Opened {formatDateTime(sentEmail.opened_at)}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Loading State */}
          {isLoading && (
            <Group justify="center" p="xl">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">
                Loading responses...
              </Text>
            </Group>
          )}

          {/* No Responses */}
          {!isLoading && responses.length === 0 && (
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              No responses received yet.
            </Alert>
          )}

          {/* Responses and Auto-Replies */}
          {!isLoading &&
            responses.map((response) => (
              <Stack key={response.id} gap="sm">
                <Divider
                  label={
                    <Text size="xs" c="dimmed">
                      ↓
                    </Text>
                  }
                  labelPosition="center"
                />

                {/* Customer Response */}
                <Paper p="md" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconUser size={16} />
                        <Text size="sm" fw={600}>
                          {response.from_email}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {formatDateTime(response.received_at)}
                      </Text>
                    </Group>

                    <Text size="sm" fw={500}>
                      Subject: {response.subject}
                    </Text>

                    <Divider />

                    <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                      {response.body}
                    </Text>

                    <Group gap="xs" mt="xs">
                      <Badge
                        size="sm"
                        variant="light"
                        color={getSentimentColor(response.sentiment)}
                      >
                        {response.sentiment} (
                        {Math.round(response.sentiment_score * 100)}%)
                      </Badge>
                      {response.is_auto_replied && (
                        <Badge size="sm" variant="light" color="violet">
                          Auto-Replied
                        </Badge>
                      )}
                    </Group>
                  </Stack>
                </Paper>

                {/* Auto-Replies */}
                {response.auto_replies?.map((autoReply) => (
                  <React.Fragment key={autoReply.id}>
                    <Divider
                      label={
                        <Text size="xs" c="dimmed">
                          ↓
                        </Text>
                      }
                      labelPosition="center"
                    />

                    <Paper
                      p="md"
                      withBorder
                      style={{
                        backgroundColor:
                          autoReply.status === "sent"
                            ? "#f3faf3"
                            : autoReply.status === "pending"
                            ? "#fff9db"
                            : "#ffe9e9",
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <IconRobot size={16} />
                            <Text size="sm" fw={600}>
                              Auto-Reply{" "}
                              {getAutoReplyStatusIcon(autoReply.status)}
                            </Text>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {formatDateTime(autoReply.sent_at)}
                          </Text>
                        </Group>

                        <Text size="sm" fw={500}>
                          Subject: {autoReply.subject}
                        </Text>

                        <Divider />

                        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                          {autoReply.body}
                        </Text>

                        <Group gap="xs" mt="xs">
                          <Badge
                            size="sm"
                            variant="filled"
                            color={
                              autoReply.status === "sent"
                                ? "green"
                                : autoReply.status === "pending"
                                ? "yellow"
                                : "red"
                            }
                          >
                            {autoReply.status}
                          </Badge>
                        </Group>

                        {autoReply.status === "failed" &&
                          autoReply.error_message && (
                            <Alert color="red" variant="light" p="xs">
                              <Text size="xs">
                                Error: {autoReply.error_message}
                              </Text>
                            </Alert>
                          )}
                      </Stack>
                    </Paper>
                  </React.Fragment>
                ))}
              </Stack>
            ))}
        </Stack>
      </ScrollArea.Autosize>
    </Modal>
  );
};

export default EmailThreadModal;

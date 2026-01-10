import React, { useState } from "react";
import {
  Stack,
  Switch,
  Textarea,
  Button,
  Alert,
  Paper,
  Text,
  Group,
  Collapse,
  Card,
  Loader,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconRobot,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getAutoReplyConfig,
  updateAutoReplyConfig,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface AutoReplySettingsProps {
  campaignId: number;
  teamAssignmentEnabled?: boolean;
}

const EXAMPLE_THEMES = [
  {
    title: "Professional Sales",
    content:
      "Respond in a professional, consultative tone. If they express interest, ask about their specific needs and offer to schedule a 15-minute discovery call. If they have objections, acknowledge them respectfully and provide relevant information. Always end with a clear call-to-action. Keep responses under 100 words.",
  },
  {
    title: "Customer Support",
    content:
      "Be empathetic and helpful. Answer their questions directly and thoroughly. If the issue is complex, offer to escalate to a specialist. Provide relevant documentation links when applicable. Always thank them for reaching out.",
  },
  {
    title: "Event Invitation",
    content:
      "Respond enthusiastically! If they're interested, provide registration link and event details. If they can't attend, ask if they'd like future event notifications. Keep it brief and friendly.",
  },
];

const MAX_THEME_LENGTH = 5000;

// ============================================================================
// Main Component
// ============================================================================

const AutoReplySettings: React.FC<AutoReplySettingsProps> = ({
  campaignId,
  teamAssignmentEnabled = false,
}) => {
  const queryClient = useQueryClient();

  // ------------------------------------------------------------
  // State
  // ------------------------------------------------------------
  const [enabled, setEnabled] = useState(false);
  const [theme, setTheme] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { isLoading } = useQuery(
    [EmailOutreachQueryNames.GET_AUTO_REPLY_CONFIG, campaignId],
    () => getAutoReplyConfig(campaignId),
    {
      enabled: !!campaignId,
      refetchOnWindowFocus: false,
      onSuccess: (response) => {
        setEnabled(response.data.auto_reply_enabled);
        setTheme(response.data.auto_reply_theme || "");
        setHasUnsavedChanges(false);
      },
    },
  );

  // ============================================================================
  // Mutations
  // ============================================================================

  const updateMutation = useMutation(
    (data: { auto_reply_enabled: boolean; auto_reply_theme?: string }) =>
      updateAutoReplyConfig(campaignId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_AUTO_REPLY_CONFIG,
          campaignId,
        ]);
        setSuccessMessage("Auto-reply settings saved successfully!");
        setErrorMessage("");
        setHasUnsavedChanges(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail ||
            "Failed to save auto-reply settings. Please try again.",
        );
        setSuccessMessage("");
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleEnabledChange = (checked: boolean) => {
    // Check for mutual exclusivity
    if (checked && teamAssignmentEnabled) {
      setErrorMessage(
        "Cannot enable Auto-Reply while Team Assignment is enabled. Please disable Team Assignment first.",
      );
      return;
    }

    setEnabled(checked);
    setHasUnsavedChanges(true);
    if (!checked) {
      // Clear theme when disabling
      setTheme("");
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    setHasUnsavedChanges(true);
    setErrorMessage("");
  };

  const handleExampleClick = (exampleContent: string) => {
    setTheme(exampleContent);
    setHasUnsavedChanges(true);
    setShowExamples(false);
  };

  const handleSave = () => {
    // Validation
    if (enabled && !theme.trim()) {
      setErrorMessage("Theme/prompt is required when auto-reply is enabled");
      return;
    }

    if (theme.length > MAX_THEME_LENGTH) {
      setErrorMessage(`Theme must be less than ${MAX_THEME_LENGTH} characters`);
      return;
    }

    // Submit
    updateMutation.mutate({
      auto_reply_enabled: enabled,
      auto_reply_theme: enabled ? theme : undefined,
    });
  };

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <Paper p="md" withBorder>
        <Group justify="center" p="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading auto-reply settings...
          </Text>
        </Group>
      </Paper>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group>
          <IconRobot size={24} />
          <div>
            <Text fw={600} size="md">
              Auto-Reply Settings
            </Text>
            <Text size="sm" c="dimmed">
              Automatically respond to email replies using AI
            </Text>
          </div>
        </Group>

        {/* Mutual Exclusivity Warning */}
        {teamAssignmentEnabled && (
          <Alert
            color="blue"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            <Text size="sm">
              Auto-Reply and Team Assignment are mutually exclusive. Disable
              Team Assignment to enable Auto-Reply.
            </Text>
          </Alert>
        )}

        {/* Error/Success Messages */}
        {errorMessage && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            withCloseButton
            onClose={() => setErrorMessage("")}
          >
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            color="green"
            withCloseButton
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {/* Enable/Disable Toggle */}
        <Switch
          checked={enabled}
          onChange={(event) => handleEnabledChange(event.currentTarget.checked)}
          label="Enable Auto-Reply"
          description="Automatically generate and send replies to incoming emails"
          size="md"
          disabled={teamAssignmentEnabled}
        />

        {/* Theme Input */}
        {enabled && (
          <Stack gap="sm">
            <div>
              <Text size="sm" fw={500} mb="xs">
                Reply Theme/Instructions
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Describe how you want the AI to respond. Be specific about tone,
                approach, and what to include.
              </Text>
            </div>

            <Textarea
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              placeholder="Example: Respond professionally and briefly. If they're interested, ask for a meeting time. If they have questions, answer concisely and offer to schedule a call. Always be friendly and helpful."
              minRows={6}
              maxRows={12}
              description={`${theme.length} / ${MAX_THEME_LENGTH} characters`}
              error={theme.length > MAX_THEME_LENGTH}
            />

            {/* Example Templates */}
            <Button
              variant="light"
              size="xs"
              leftSection={
                showExamples ? (
                  <IconChevronUp size={14} />
                ) : (
                  <IconChevronDown size={14} />
                )
              }
              onClick={() => setShowExamples(!showExamples)}
            >
              {showExamples ? "Hide" : "Show"} Example Templates
            </Button>

            <Collapse in={showExamples}>
              <Stack gap="xs">
                {EXAMPLE_THEMES.map((example, index) => (
                  <Card
                    key={index}
                    withBorder
                    padding="sm"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleExampleClick(example.content)}
                  >
                    <Text size="sm" fw={500} mb="xs">
                      {example.title}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={3}>
                      {example.content}
                    </Text>
                  </Card>
                ))}
              </Stack>
            </Collapse>

            {/* Guidelines */}
            <Alert color="blue" variant="light">
              <Text size="xs" fw={500} mb="xs">
                💡 Tips for effective auto-replies:
              </Text>
              <Text size="xs" component="ul" style={{ marginLeft: "1rem" }}>
                <li>Specify the tone (professional, casual, friendly)</li>
                <li>Define what to do if interested vs not interested</li>
                <li>Mention whether to offer meetings/calls</li>
                <li>Include any specific information to include or avoid</li>
                <li>Set response length guidelines</li>
              </Text>
            </Alert>
          </Stack>
        )}

        {/* Save Button */}
        <Group justify="flex-end">
          {hasUnsavedChanges && (
            <Text size="xs" c="dimmed">
              You have unsaved changes
            </Text>
          )}
          <Button
            onClick={handleSave}
            loading={updateMutation.isLoading}
            disabled={!hasUnsavedChanges}
          >
            Save Auto-Reply Settings
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default AutoReplySettings;

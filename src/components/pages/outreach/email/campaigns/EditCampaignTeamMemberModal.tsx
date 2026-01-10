import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  NumberInput,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Text,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { IconX, IconCheck } from "@tabler/icons-react";
import { updateCampaignTeamMember } from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignTeamMember,
  CampaignTeamMemberUpdateRequest,
} from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface EditCampaignTeamMemberModalProps {
  campaignId: number;
  member: CampaignTeamMember | null;
  opened: boolean;
  onClose: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

const EditCampaignTeamMemberModal: React.FC<
  EditCampaignTeamMemberModalProps
> = ({ campaignId, member, opened, onClose }) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================================
  // Form Setup
  // ============================================================================

  const form = useForm<{
    priority: number;
    role: string;
    expertise: string;
    instructions: string;
    handling_guidelines: string;
    is_active: boolean;
  }>({
    initialValues: {
      priority: 5,
      role: "",
      expertise: "",
      instructions: "",
      handling_guidelines: "",
      is_active: true,
    },
    validate: {
      priority: (value: number) =>
        value < 1 || value > 10 ? "Priority must be between 1 and 10" : null,
    },
  });

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    if (member && opened) {
      const details = member.assignment_details || {};
      form.setValues({
        priority: member.priority,
        role: details.role || "",
        expertise: Array.isArray(details.expertise)
          ? details.expertise.join(", ")
          : "",
        instructions: details.instructions || "",
        handling_guidelines: details.handling_guidelines || "",
        is_active: member.is_active,
      });
    }
  }, [form, member, opened]);

  // ============================================================================
  // Mutations
  // ============================================================================

  const updateMutation = useMutation(
    (data: CampaignTeamMemberUpdateRequest) =>
      updateCampaignTeamMember(campaignId, member!.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_TEAM_MEMBERS,
          campaignId,
        ]);
        setSuccessMessage("Team member updated successfully!");
        setErrorMessage("");
        setTimeout(() => {
          handleClose();
        }, 1500);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to update team member",
        );
        setSuccessMessage("");
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSubmit = (values: typeof form.values) => {
    if (!member) return;

    setErrorMessage("");

    const assignmentDetails: any = {};

    if (values.role) assignmentDetails.role = values.role;
    if (values.expertise) {
      assignmentDetails.expertise = values.expertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (values.instructions)
      assignmentDetails.instructions = values.instructions;
    if (values.handling_guidelines)
      assignmentDetails.handling_guidelines = values.handling_guidelines;

    const requestData: CampaignTeamMemberUpdateRequest = {
      priority: values.priority,
      is_active: values.is_active,
    };

    if (Object.keys(assignmentDetails).length > 0) {
      requestData.assignment_details = assignmentDetails;
    }

    updateMutation.mutate(requestData);
  };

  const handleClose = () => {
    form.reset();
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (!member) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          Edit Team Member Assignment
        </Text>
      }
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <div>
            <Text size="sm" fw={500} c="dimmed">
              Team Member
            </Text>
            <Text size="md" fw={500}>
              {member.team_member_name}
            </Text>
            <Text size="sm" c="dimmed">
              {member.team_member_email}
            </Text>
          </div>

          <NumberInput
            label="Priority"
            description="Higher priority members are more likely to receive assignments (1-10)"
            min={1}
            max={10}
            required
            {...form.getInputProps("priority")}
          />

          <Switch
            label="Active"
            description="Inactive members won't receive new assignments"
            {...form.getInputProps("is_active", { type: "checkbox" })}
          />

          <Text size="sm" fw={500} mt="md">
            Assignment Details
          </Text>

          <TextInput
            label="Role"
            placeholder="e.g., technical_support, sales, customer_success"
            {...form.getInputProps("role")}
          />

          <TextInput
            label="Expertise (comma-separated)"
            placeholder="e.g., API, SDK, integrations, billing"
            description="Areas this team member specializes in"
            {...form.getInputProps("expertise")}
          />

          <Textarea
            label="Instructions for AI"
            placeholder="Describe what this team member should handle..."
            minRows={3}
            {...form.getInputProps("instructions")}
          />

          <Textarea
            label="Handling Guidelines"
            placeholder="Guidelines for how this member should respond..."
            minRows={3}
            {...form.getInputProps("handling_guidelines")}
          />

          {errorMessage && (
            <Alert icon={<IconX size={16} />} title="Error" color="red">
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert icon={<IconCheck size={16} />} title="Success" color="green">
              {successMessage}
            </Alert>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={handleClose}
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={updateMutation.isLoading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EditCampaignTeamMemberModal;

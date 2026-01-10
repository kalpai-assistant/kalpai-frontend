import React, { useState } from "react";
import {
  Modal,
  Stack,
  Select,
  NumberInput,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { IconX, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import {
  addCampaignTeamMember,
  getTeamMembers,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignTeamMemberCreateRequest,
} from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface AddCampaignTeamMemberModalProps {
  campaignId: number;
  opened: boolean;
  onClose: () => void;
}

// ============================================================================
// Main Component
// ============================================================================

const AddCampaignTeamMemberModal: React.FC<AddCampaignTeamMemberModalProps> = ({
  campaignId,
  opened,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: teamMembersResponse, isLoading: isLoadingMembers } = useQuery(
    EmailOutreachQueryNames.GET_TEAM_MEMBERS,
    getTeamMembers,
    {
      enabled: opened,
      refetchOnWindowFocus: false,
    },
  );

  // ============================================================================
  // Form Setup
  // ============================================================================

  const form = useForm<{
    team_member_id: string;
    priority: number;
    role: string;
    expertise: string;
    instructions: string;
    handling_guidelines: string;
  }>({
    initialValues: {
      team_member_id: "",
      priority: 5,
      role: "",
      expertise: "",
      instructions: "",
      handling_guidelines: "",
    },
    validate: {
      team_member_id: (value) =>
        !value ? "Please select a team member" : null,
      priority: (value) =>
        value < 1 || value > 10 ? "Priority must be between 1 and 10" : null,
    },
  });

  // ============================================================================
  // Mutations
  // ============================================================================

  const addMutation = useMutation(
    (data: CampaignTeamMemberCreateRequest) =>
      addCampaignTeamMember(campaignId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_TEAM_MEMBERS,
          campaignId,
        ]);
        setSuccessMessage("Team member added successfully!");
        setErrorMessage("");
        setTimeout(() => {
          handleClose();
        }, 1500);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to add team member",
        );
        setSuccessMessage("");
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSubmit = (values: typeof form.values) => {
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

    const requestData: CampaignTeamMemberCreateRequest = {
      team_member_id: parseInt(values.team_member_id),
      priority: values.priority,
    };

    if (Object.keys(assignmentDetails).length > 0) {
      requestData.assignment_details = assignmentDetails;
    }

    addMutation.mutate(requestData);
  };

  const handleClose = () => {
    form.reset();
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  // ============================================================================
  // Derived Data
  // ============================================================================

  const teamMembers = teamMembersResponse?.data?.team_members || [];
  const teamMemberOptions = teamMembers.map((member) => ({
    value: String(member.id),
    label: `${member.name || member.email} ${
      member.role ? `(${member.role})` : ""
    }`,
  }));

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="lg">
          Assign Team Member to Campaign
        </Text>
      }
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert
            color="blue"
            icon={<IconAlertCircle size={16} />}
            variant="light"
          >
            <Text size="sm">
              Assign team members to handle responses for this campaign. The AI
              will intelligently route emails based on the assignment details
              you provide.
            </Text>
          </Alert>

          <Select
            label="Team Member"
            placeholder="Select team member"
            data={teamMemberOptions}
            required
            disabled={isLoadingMembers}
            searchable
            {...form.getInputProps("team_member_id")}
          />

          <NumberInput
            label="Priority"
            description="Higher priority members are more likely to receive assignments (1-10)"
            min={1}
            max={10}
            required
            {...form.getInputProps("priority")}
          />

          <Text size="sm" fw={500} mt="md">
            Assignment Details (Optional but Recommended)
          </Text>
          <Text size="xs" c="dimmed">
            These details help the AI route emails to the right team member
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
            description="Help the AI understand when to route emails to this person"
            minRows={3}
            {...form.getInputProps("instructions")}
          />

          <Textarea
            label="Handling Guidelines"
            placeholder="Guidelines for how this member should respond..."
            description="Best practices for responding to assigned emails"
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
              disabled={addMutation.isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={addMutation.isLoading}>
              Add Team Member
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddCampaignTeamMemberModal;

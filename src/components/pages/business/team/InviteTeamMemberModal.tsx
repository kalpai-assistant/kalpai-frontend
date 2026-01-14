import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Flex,
  Paper,
  Text,
  Group,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import {
  IconUserPlus,
  IconMail,
  IconUser,
  IconBriefcase,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "react-query";
import { inviteTeamMember } from "../../../../api/team";
import { InviteTeamMemberRequest } from "../../../../api/requests_responses/team";
import { TeamQueryNames } from "../../../../api/requests_responses/team";
import { notifications } from "@mantine/notifications";
import { AxiosResponse } from "axios";

interface InviteTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

const InviteTeamMemberModal: React.FC<InviteTeamMemberModalProps> = ({
  opened,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");

  const form = useForm<InviteTeamMemberRequest>({
    initialValues: {
      email: "",
      name: "",
      role: "",
      description: "",
      role_type: "member",
      permissions: {},
    },
    validate: {
      email: (value) => {
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : "Invalid email address";
      },
      name: (value) => (!value ? "Name is required" : null),
      role: (value) => (!value ? "Role is required" : null),
    },
  });

  const { mutate: inviteMutation, isLoading } = useMutation(inviteTeamMember, {
    onSuccess: (response: AxiosResponse) => {
      queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_MEMBERS);
      queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_STATS);
      notifications.show({
        title: "Success",
        message: `Invitation sent to ${form.values.email}`,
        color: "green",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.detail || "Failed to send invitation";
      setError(errorMessage);
    },
  });

  const handleSubmit = (values: InviteTeamMemberRequest) => {
    setError("");
    inviteMutation(values);
  };

  const roleTypeOptions = [
    {
      value: "owner",
      label: "Owner",
      description: "Full access to all features and settings",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Manage team and business operations",
    },
    {
      value: "member",
      label: "Member",
      description: "Access to business features",
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "Read-only access",
    },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Flex align="center" gap="xs">
          <IconUserPlus size={24} />
          <Text size="lg" fw={600}>
            Invite Team Member
          </Text>
        </Flex>
      }
      size="lg"
      centered
      transitionProps={{ transition: "slide-up", duration: 300 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex direction="column" gap="md">
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <TextInput
            label="Email Address"
            placeholder="john.doe@company.com"
            required
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
          />

          <TextInput
            label="Full Name"
            placeholder="John Doe"
            required
            leftSection={<IconUser size={16} />}
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Role Title"
            placeholder="e.g., Sales Manager, Customer Support Lead"
            required
            leftSection={<IconBriefcase size={16} />}
            {...form.getInputProps("role")}
          />

          <div>
            <Text size="sm" fw={500} mb={8}>
              Role Type
            </Text>
            <Flex direction="column" gap="xs">
              {roleTypeOptions.map((option) => (
                <Paper
                  key={option.value}
                  p="md"
                  withBorder
                  style={{
                    cursor: "pointer",
                    borderColor:
                      form.values.role_type === option.value
                        ? "var(--mantine-color-blue-6)"
                        : undefined,
                    borderWidth: form.values.role_type === option.value ? 2 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    form.setFieldValue("role_type", option.value as any)
                  }
                >
                  <Flex justify="space-between" align="center">
                    <div>
                      <Text fw={500}>{option.label}</Text>
                      <Text size="xs" c="dimmed">
                        {option.description}
                      </Text>
                    </div>
                    {form.values.role_type === option.value && (
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "var(--mantine-color-blue-6)",
                        }}
                      />
                    )}
                  </Flex>
                </Paper>
              ))}
            </Flex>
          </div>

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of responsibilities..."
            minRows={3}
            {...form.getInputProps("description")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={<IconUserPlus size={16} />}
            >
              Send Invitation
            </Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  );
};

export default InviteTeamMemberModal;

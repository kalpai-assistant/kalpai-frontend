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
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import {
  IconDeviceFloppy,
  IconUser,
  IconBriefcase,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "react-query";
import { updateTeamMember } from "../../../../api/team";
import {
  UpdateTeamMemberRequest,
  TeamMember,
} from "../../../../api/requests_responses/team";
import { TeamQueryNames } from "../../../../api/requests_responses/team";
import { notifications } from "@mantine/notifications";
import { AxiosResponse } from "axios";

interface UpdateTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
  member: TeamMember | null;
}

const UpdateTeamMemberModal: React.FC<UpdateTeamMemberModalProps> = ({
  opened,
  onClose,
  member,
}) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string>("");

  const form = useForm<UpdateTeamMemberRequest>({
    initialValues: {
      name: member?.name || "",
      role: member?.role || "",
      description: member?.description || "",
      role_type: member?.role_type || "member",
      is_active: member?.is_active ?? true,
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
      role: (value) => (!value ? "Role is required" : null),
    },
  });

  // Update form when member changes
  useState(() => {
    if (member) {
      form.setValues({
        name: member.name || "",
        role: member.role || "",
        description: member.description || "",
        role_type: member.role_type,
        is_active: member.is_active,
      });
    }
  });

  const { mutate: updateMutation, isLoading } = useMutation(
    (data: UpdateTeamMemberRequest) => updateTeamMember(member!.id, data),
    {
      onSuccess: (response: AxiosResponse) => {
        queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_MEMBERS);
        queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_MEMBER);
        queryClient.invalidateQueries(TeamQueryNames.GET_TEAM_STATS);
        notifications.show({
          title: "Success",
          message: "Team member updated successfully",
          color: "green",
        });
        onClose();
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.detail || "Failed to update team member";
        setError(errorMessage);
      },
    },
  );

  const handleSubmit = (values: UpdateTeamMemberRequest) => {
    setError("");
    updateMutation(values);
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

  if (!member) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Flex align="center" gap="xs">
          <IconUser size={24} />
          <Text size="lg" fw={600}>
            Update Team Member
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

          <Switch
            label="Active Status"
            description="Inactive members cannot log in"
            {...form.getInputProps("is_active", { type: "checkbox" })}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              leftSection={<IconDeviceFloppy size={16} />}
            >
              Save Changes
            </Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  );
};

export default UpdateTeamMemberModal;

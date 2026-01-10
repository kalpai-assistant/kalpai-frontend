import React from "react";
import {
  Modal,
  TextInput,
  Button,
  Stack,
  Alert,
  Group,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { addTeamMember } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

interface AddTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  opened,
  onClose,
  onComplete,
}) => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      role: "",
      description: "",
    },
    validate: {
      email: (value: string) =>
        !value
          ? "Email is required"
          : !/^\S+@\S+$/.test(value)
          ? "Invalid email format"
          : null,
    },
  });

  const addMutation = useMutation(addTeamMember, {
    onSuccess: () => {
      setSuccessMessage("Team member added successfully!");
      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_TEAM_MEMBERS);
      form.reset();
      setTimeout(() => {
        setSuccessMessage("");
        onComplete();
      }, 1500);
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.detail || "Failed to add team member",
      );
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setErrorMessage("");
    setSuccessMessage("");
    addMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    setErrorMessage("");
    setSuccessMessage("");
    onClose();
  };

  return (
    <Modal opened={opened} onClose={handleClose} title="Add Team Member">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {successMessage && (
            <Alert icon={<IconCheck size={16} />} title="Success" color="green">
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert icon={<IconX size={16} />} title="Error" color="red">
              {errorMessage}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="member@example.com"
            required
            {...form.getInputProps("email")}
          />

          <TextInput
            label="Name"
            placeholder="Optional"
            {...form.getInputProps("name")}
          />

          <TextInput
            label="Role"
            placeholder="Optional"
            {...form.getInputProps("role")}
          />

          <Textarea
            label="Description"
            placeholder="Optional"
            rows={6}
            description="Optional description for this team member"
            {...form.getInputProps("description")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={addMutation.isLoading}>
              Add Member
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AddTeamMemberModal;

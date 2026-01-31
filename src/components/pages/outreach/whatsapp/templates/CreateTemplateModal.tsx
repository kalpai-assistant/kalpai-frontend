import React from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { createTemplate } from "../../../../../api/outreach/whatsapp";
import {
  WhatsAppQueryNames,
  TemplateCategory,
} from "../../../../../api/requests_responses/outreach/whatsapp";

interface CreateTemplateModalProps {
  opened: boolean;
  onClose: () => void;
  accountId: number;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  opened,
  onClose,
  accountId,
}) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: "",
      category: "MARKETING" as TemplateCategory,
      body: "",
      language: "en",
      footer: "",
    },
    validate: {
      name: (value: string) => {
        if (!value) return "Template name is required";
        if (!/^[a-z0-9_]+$/.test(value))
          return "Only lowercase letters, numbers, and underscores allowed";
        return null;
      },
      body: (value: string) => (!value ? "Template body is required" : null),
    },
  });

  const createMutation = useMutation(
    async (values: typeof form.values) => {
      return createTemplate(accountId, {
        name: values.name,
        category: values.category,
        body: values.body,
        language: values.language,
        footer: values.footer || undefined,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          WhatsAppQueryNames.GET_TEMPLATES,
          accountId.toString(),
        ]);
        form.reset();
        onClose();
      },
      onError: (error: any) => {
        console.error("Error creating template:", error);
      },
    },
  );

  const handleSubmit = (values: typeof form.values) => {
    createMutation.mutate(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Message Template"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Template Guidelines"
            color="blue"
            variant="light"
          >
            <Text size="xs">
              Templates must be approved by Meta before use. Use placeholders
              like {`{{1}}`}, {`{{2}}`} for dynamic content.
            </Text>
          </Alert>

          <TextInput
            label="Template Name"
            placeholder="welcome_message"
            description="Use lowercase with underscores only"
            required
            {...form.getInputProps("name")}
          />

          <Select
            label="Category"
            required
            data={[
              { value: "MARKETING", label: "Marketing" },
              { value: "UTILITY", label: "Utility" },
              { value: "AUTHENTICATION", label: "Authentication" },
            ]}
            {...form.getInputProps("category")}
          />

          <Textarea
            label="Message Body"
            placeholder="Hi {{1}}! Welcome to {{2}}. Get {{3}} off your first order!"
            description="Use {{1}}, {{2}}, etc. for dynamic parameters"
            required
            minRows={4}
            {...form.getInputProps("body")}
          />

          <TextInput
            label="Footer (Optional)"
            placeholder="Reply STOP to unsubscribe"
            {...form.getInputProps("footer")}
          />

          <Select
            label="Language"
            required
            data={[
              { value: "en", label: "English" },
              { value: "es", label: "Spanish" },
              { value: "fr", label: "French" },
              { value: "de", label: "German" },
              { value: "hi", label: "Hindi" },
            ]}
            {...form.getInputProps("language")}
          />

          {createMutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
            >
              Failed to create template. Please try again.
            </Alert>
          )}

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="green"
              loading={createMutation.isLoading}
            >
              Submit for Approval
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateTemplateModal;

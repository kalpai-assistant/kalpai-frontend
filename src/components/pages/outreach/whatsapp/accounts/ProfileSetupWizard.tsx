import React from "react";
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "react-query";
import { IconPhoto } from "@tabler/icons-react";
import { setupWhatsAppProfile } from "../../../../../api/outreach/whatsapp";
import { notifications } from "@mantine/notifications";

const BUSINESS_CATEGORIES = [
  "Business Services",
  "E-commerce",
  "Education",
  "Healthcare",
  "Real Estate",
  "Restaurant",
  "Retail",
  "Technology",
  "Other",
];

interface ProfileSetupWizardProps {
  opened: boolean;
  prefilledData: {
    name: string;
    description?: string;
    category: string;
    website?: string;
  };
  onComplete: () => void;
  onCancel: () => void;
}

const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({
  opened,
  prefilledData,
  onComplete,
  onCancel,
}) => {
  const form = useForm({
    initialValues: prefilledData,
    validate: {
      name: (value: string) => {
        if (!value?.trim()) return "Business name is required";
        if (value.length > 100) return "Name must be less than 100 characters";
        return null;
      },
      description: (value: string | undefined) => {
        if (value && value.length > 500)
          return "Description must be less than 500 characters";
        return null;
      },
      category: (value: string) => (!value ? "Please select a category" : null),
      website: (value: string | undefined) => {
        if (value && !value.startsWith("http"))
          return "Website must start with http:// or https://";
        return null;
      },
    },
  });

  const setupMutation = useMutation(
    async (data: typeof form.values) => {
      const response = await setupWhatsAppProfile(data);
      return response.data;
    },
    {
      onSuccess: () => {
        onComplete();
      },
      onError: (error: any) => {
        notifications.show({
          title: "Setup Failed",
          message:
            error.response?.data?.detail ||
            "Failed to set up profile. Please try again.",
          color: "red",
        });
      },
    },
  );

  const handleSubmit = form.onSubmit((values) => {
    setupMutation.mutate(values);
  });

  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={
        <Text size="xl" fw={700}>
          Set up your WhatsApp Business Profile
        </Text>
      }
      size="lg"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Review and customize how your business appears on WhatsApp
          </Text>

          <TextInput
            label="Business Name"
            placeholder="Your Business Name"
            required
            {...form.getInputProps("name")}
            description="This will be displayed to your customers"
          />

          <Textarea
            label="Business Description"
            placeholder="Tell customers about your business..."
            rows={3}
            {...form.getInputProps("description")}
            description={`${form.values.description?.length || 0}/500 characters`}
          />

          <Select
            label="Business Category"
            placeholder="Select a category"
            required
            data={BUSINESS_CATEGORIES}
            {...form.getInputProps("category")}
          />

          <TextInput
            label="Website"
            placeholder="https://yourwebsite.com"
            type="url"
            {...form.getInputProps("website")}
          />

          <Alert icon={<IconPhoto size={16} />} color="blue" variant="light">
            <Text size="sm" fw={600}>
              📸 Profile Picture
            </Text>
            <Text size="xs">
              You can upload your logo after activation. It requires Meta
              verification (1-2 days).
            </Text>
          </Alert>

          <Group justify="flex-end" mt="xl">
            <Button
              variant="default"
              onClick={onCancel}
              disabled={setupMutation.isLoading}
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              color="green"
              loading={setupMutation.isLoading}
            >
              Confirm & Activate
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default ProfileSetupWizard;

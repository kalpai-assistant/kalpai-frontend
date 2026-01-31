import React from "react";
import { Stack, TextInput, Textarea, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { requestWhatsAppAccount } from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";
import { notifications } from "@mantine/notifications";

interface RequestAccountFormProps {
  onSuccess: () => void;
}

const RequestAccountForm: React.FC<RequestAccountFormProps> = ({
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      business_name: "",
      request_details: "",
    },
    validate: {
      business_name: (value: string) => {
        if (!value?.trim()) return "Business name is required";
        if (value.length > 100) return "Name must be less than 100 characters";
        return null;
      },
      request_details: (value: string) => {
        if (!value?.trim())
          return "Please provide some details for your request";
        return null;
      },
    },
  });

  const requestMutation = useMutation(
    async (data: typeof form.values) => {
      const response = await requestWhatsAppAccount(data);
      return response.data;
    },
    {
      onSuccess: () => {
        notifications.show({
          title: "Request Submitted",
          message:
            "Your WhatsApp account request has been submitted for approval.",
          color: "green",
          icon: <IconCheck size={16} />,
        });
        queryClient.invalidateQueries(WhatsAppQueryNames.GET_WHATSAPP_ACCOUNTS);
        onSuccess();
      },
      onError: (error: any) => {
        notifications.show({
          title: "Request Failed",
          message:
            error.response?.data?.detail ||
            "Failed to submit request. Please try again.",
          color: "red",
        });
      },
    },
  );

  const handleSubmit = form.onSubmit((values) => {
    requestMutation.mutate(values);
  });

  return (
    <Stack gap="md">
      <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
        <Text size="sm">
          To enable WhatsApp, please submit a request. An admin will review your
          details and provision a dedicated Twilio number for your business.
        </Text>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Business Name"
            placeholder="Acme Corp"
            required
            {...form.getInputProps("business_name")}
          />

          <Textarea
            label="Request Details"
            placeholder="Describe your use case (e.g., Customer support, Order notifications)"
            minRows={3}
            required
            {...form.getInputProps("request_details")}
          />

          <Button
            type="submit"
            color="blue"
            loading={requestMutation.isLoading}
            fullWidth
          >
            Submit Request
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default RequestAccountForm;

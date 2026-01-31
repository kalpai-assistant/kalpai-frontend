import React, { useState } from "react";
import { Button, Stack, Paper, Text, List, Loader } from "@mantine/core";
import { useMutation } from "react-query";
import { IconBrandWhatsapp, IconCheck } from "@tabler/icons-react";
import { enableWhatsApp } from "../../../../../api/outreach/whatsapp";
import { notifications } from "@mantine/notifications";
import ProfileSetupWizard from "./ProfileSetupWizard";

interface EnableWhatsAppButtonProps {
  onSuccess: () => void;
}

const EnableWhatsAppButton: React.FC<EnableWhatsAppButtonProps> = ({
  onSuccess,
}) => {
  const [showWizard, setShowWizard] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

  const enableMutation = useMutation(
    async () => {
      const response = await enableWhatsApp();
      return response.data;
    },
    {
      onSuccess: (account) => {
        // Prefill wizard with business data from localStorage
        const businessData = JSON.parse(
          localStorage.getItem("business") || "{}",
        );

        setPrefilledData({
          name: businessData.name || "",
          description:
            businessData.description ||
            `Connect with ${businessData.name || "us"} on WhatsApp`,
          category: businessData.business_type || "Business Services",
          website: businessData.website || window.location.origin,
        });

        setShowWizard(true);

        notifications.show({
          title: "WhatsApp Enabled!",
          message: `Number provisioned: ${account.phone_number}`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      },
      onError: (error: any) => {
        notifications.show({
          title: "Enable Failed",
          message:
            error.response?.data?.detail ||
            "Failed to enable WhatsApp. Please try again.",
          color: "red",
        });
      },
    },
  );

  const handleWizardComplete = () => {
    setShowWizard(false);
    notifications.show({
      title: "Success!",
      message: "WhatsApp Business Profile activated successfully!",
      color: "green",
      icon: <IconCheck size={16} />,
    });
    onSuccess();
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
    notifications.show({
      title: "Setup Skipped",
      message: "You can set up your profile later in account settings.",
      color: "blue",
    });
    onSuccess();
  };

  return (
    <>
      <Paper
        p="xl"
        withBorder
        style={{
          maxWidth: 600,
          margin: "40px auto",
          textAlign: "center",
        }}
      >
        <Stack gap="lg">
          <Paper
            p="xl"
            style={{
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              color: "white",
              borderRadius: 12,
            }}
          >
            <IconBrandWhatsapp size={64} style={{ margin: "0 auto 16px" }} />
            <Text size="xl" fw={700} mb="md">
              Enable WhatsApp Business
            </Text>
            <Text size="sm" mb="lg">
              Get a dedicated WhatsApp number to communicate with your customers
            </Text>

            <List
              spacing="sm"
              size="sm"
              icon={<IconCheck size={16} />}
              style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}
            >
              <List.Item>Instant activation</List.Item>
              <List.Item>Send campaigns and templates</List.Item>
              <List.Item>Two-way messaging</List.Item>
              <List.Item>Track delivery and read receipts</List.Item>
            </List>
          </Paper>

          <Button
            size="lg"
            leftSection={<IconBrandWhatsapp size={20} />}
            onClick={() => enableMutation.mutate()}
            loading={enableMutation.isLoading}
            color="green"
            disabled={enableMutation.isLoading}
          >
            {enableMutation.isLoading ? (
              <>
                <Loader size="sm" color="white" mr="xs" />
                Activating...
              </>
            ) : (
              "Enable WhatsApp"
            )}
          </Button>
        </Stack>
      </Paper>

      {showWizard && prefilledData && (
        <ProfileSetupWizard
          opened={showWizard}
          prefilledData={prefilledData}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}
    </>
  );
};

export default EnableWhatsAppButton;

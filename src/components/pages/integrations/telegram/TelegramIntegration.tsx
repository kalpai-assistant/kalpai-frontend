import React, { useState } from "react";
import { Paper, Tabs, Text, Loader } from "@mantine/core";
import { useQuery } from "react-query";
import TelegramDashboard from "../../../pages/integrations/telegram/TelegramDashboard";
import TelegramInteractions from "../../../pages/integrations/telegram/TelegramInteractions";
import TelegramSetupModal from "../../../pages/integrations/telegram/TelegramSetupModal";
import TelegramSetupForm from "../../../pages/integrations/telegram/TelegramSetupForm";
import { getTelegramBotConfig } from "../../../../api/telegram";
import { TelegramQueryNames } from "../../../../api/requests_responses/telegram";

const TelegramIntegration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const {
    data: botConfig,
    isLoading,
    refetch: refetchBotConfig,
  } = useQuery(TelegramQueryNames.GET_BOT_CONFIG, getTelegramBotConfig, {
    retry: false,
    refetchOnWindowFocus: false,
    onError: (err: any) => {
      // If bot config doesn't exist (404), show setup modal
      if (err?.response?.status === 404 || err?.status === 404) {
        setSetupModalOpen(true);
      }
    },
  });

  const handleSetupComplete = () => {
    setSetupModalOpen(false);
    refetchBotConfig();
  };

  const handleReregister = () => {
    setSetupModalOpen(true);
  };

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  // Show setup form directly if no bot config exists
  if (!botConfig?.data && !isLoading) {
    return (
      <TelegramSetupForm
        onSetupComplete={handleSetupComplete}
        showTitle={true}
      />
    );
  }

  return (
    <>
      <Paper p="md" shadow="sm">
        <Text size="lg" fw={600} mb="md">
          Telegram Integration
        </Text>

        <Tabs
          value={activeTab}
          onChange={(value) => setActiveTab(value || "dashboard")}
        >
          <Tabs.List>
            <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
            <Tabs.Tab value="interactions">Interactions</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dashboard" pt="md">
            <TelegramDashboard
              botConfig={botConfig?.data}
              onReregister={handleReregister}
            />
          </Tabs.Panel>

          <Tabs.Panel value="interactions" pt="md">
            <TelegramInteractions />
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <TelegramSetupModal
        opened={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        onSetupComplete={handleSetupComplete}
      />
    </>
  );
};

export default TelegramIntegration;

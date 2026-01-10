import React, { useState } from "react";
import { Container, Title, Select, Paper, Text } from "@mantine/core";
import TelegramIntegration from "./telegram/TelegramIntegration";
import WhatsAppIntegration from "./whatsapp/WhatsAppIntegration";

const Integrations: React.FC = () => {
  const [selectedIntegration, setSelectedIntegration] =
    useState<string>("telegram");

  const integrationOptions = [
    {
      value: "telegram",
      label: "Telegram",
    },
    {
      value: "whatsapp",
      label: "WhatsApp",
    },
  ];

  const renderIntegrationContent = () => {
    switch (selectedIntegration) {
      case "telegram":
        return <TelegramIntegration />;
      case "whatsapp":
        return <WhatsAppIntegration />;
      default:
        return <TelegramIntegration />;
    }
  };

  return (
    <Container size="xl" p="md">
      <Title order={2} mb="lg">
        Integrations
      </Title>

      <Paper p="md" shadow="sm" mb="lg">
        <Text size="sm" c="dimmed" mb="md">
          Connect your business with popular messaging platforms
        </Text>

        <Select
          label="Select Integration Platform"
          placeholder="Choose a platform to integrate"
          data={integrationOptions}
          value={selectedIntegration}
          onChange={(value) => setSelectedIntegration(value || "telegram")}
          size="md"
          mb="lg"
        />
      </Paper>

      {renderIntegrationContent()}
    </Container>
  );
};

export default Integrations;

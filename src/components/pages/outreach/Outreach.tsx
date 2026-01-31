import React, { useState, useEffect } from "react";
import { Container, Title, SegmentedControl, Paper, Text } from "@mantine/core";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import EmailOutreach from "./email/EmailOutreach";
import WhatsAppOutreach from "./whatsapp/WhatsAppOutreach";

const ComingSoon: React.FC<{ channel: string }> = ({ channel }) => {
  return (
    <Paper p="xl" mt="md" shadow="sm" withBorder>
      <Text size="lg" fw={600} ta="center" c="dimmed">
        {channel} Outreach
      </Text>
      <Text size="sm" ta="center" c="dimmed" mt="sm">
        Coming soon!
      </Text>
    </Paper>
  );
};

const Outreach: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current channel from URL
  const getCurrentChannel = () => {
    if (location.pathname.includes("/email")) return "email";
    if (location.pathname.includes("/sms")) return "sms";
    if (location.pathname.includes("/whatsapp")) return "whatsapp";
    if (location.pathname.includes("/calling")) return "calling";
    return "email"; // Default to email
  };

  const [selectedChannel, setSelectedChannel] =
    useState<string>(getCurrentChannel());

  const handleChannelChange = (value: string) => {
    setSelectedChannel(value);
    if (value === "email") {
      navigate("/outreach/email/accounts");
    } else if (value === "whatsapp") {
      navigate("/outreach/whatsapp/accounts");
    } else {
      navigate(`/outreach/${value}`);
    }
  };

  // Navigate to default tab when email or whatsapp channel is selected initially
  useEffect(() => {
    if (
      selectedChannel === "email" &&
      location.pathname === "/outreach/email"
    ) {
      navigate("/outreach/email/accounts", { replace: true });
    } else if (
      selectedChannel === "whatsapp" &&
      location.pathname === "/outreach/whatsapp"
    ) {
      navigate("/outreach/whatsapp/accounts", { replace: true });
    }
  }, [selectedChannel, location.pathname, navigate]);

  return (
    <Container size="xl" p="md">
      <Title order={2} mb="lg">
        Outreach
      </Title>

      <Paper p="md" shadow="sm" mb="lg">
        <Text size="sm" c="dimmed" mb="md">
          Manage your outreach campaigns across multiple channels
        </Text>

        <SegmentedControl
          value={selectedChannel}
          onChange={handleChannelChange}
          data={[
            { value: "email", label: "Email" },
            { value: "sms", label: "SMS", disabled: true },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "calling", label: "Calling", disabled: true },
          ]}
          size="md"
          fullWidth
        />
      </Paper>

      <Routes>
        <Route path="/email/*" element={<EmailOutreach />} />
        <Route path="/whatsapp/*" element={<WhatsAppOutreach />} />
        <Route path="/sms" element={<ComingSoon channel="SMS" />} />
        <Route path="/calling" element={<ComingSoon channel="Calling" />} />
        <Route path="/" element={<EmailOutreach />} />
      </Routes>
    </Container>
  );
};

export default Outreach;

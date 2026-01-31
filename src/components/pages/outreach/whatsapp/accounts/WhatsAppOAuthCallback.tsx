import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Paper, Text, Loader, Stack } from "@mantine/core";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const WhatsAppOAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The backend handles the OAuth callback automatically
    // Just redirect back to accounts page after a short delay
    const timer = setTimeout(() => {
      navigate("/outreach/whatsapp/accounts", { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Paper p="xl" shadow="sm" withBorder>
      <Stack align="center" gap="lg">
        <IconBrandWhatsapp size={64} color="green" />
        <Loader size="lg" color="green" />
        <Text size="lg" fw={600}>
          Connecting WhatsApp Account...
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Please wait while we complete the connection process.
        </Text>
      </Stack>
    </Paper>
  );
};

export default WhatsAppOAuthCallback;

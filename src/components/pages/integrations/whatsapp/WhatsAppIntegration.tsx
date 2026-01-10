import React from "react";
import { Paper, Text, Title, LoadingOverlay, Flex } from "@mantine/core";
import { ReactComponent as WhatsappLogo } from "../../../../assets/images/svg/whatsapp_logo.svg";

const WhatsAppIntegration: React.FC = () => {
  return (
    <Paper p="md" shadow="sm">
      <div style={{ position: "relative", minHeight: "300px" }}>
        <LoadingOverlay
          visible={true}
          loaderProps={{
            children: (
              <Flex direction="column" align="center" gap="md">
                <div style={{ width: "48px", height: "48px" }}>
                  <WhatsappLogo width="48" height="48" />
                </div>
                <Title order={3} c="green">
                  WhatsApp Integration
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  We're working on bringing WhatsApp integration to your
                  business.
                  <br />
                  Stay tuned for updates!
                </Text>
              </Flex>
            ),
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
          }}
        />

        {/* Placeholder content underneath */}
        <div style={{ opacity: 0.3 }}>
          <Title order={4} mb="md">
            WhatsApp Business Integration
          </Title>
          <Text size="sm" c="dimmed">
            Connect your WhatsApp Business account to manage customer
            conversations, send automated responses, and track engagement
            metrics.
          </Text>
        </div>
      </div>
    </Paper>
  );
};

export default WhatsAppIntegration;

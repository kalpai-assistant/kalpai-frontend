import React from "react";
import { Text, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import ChatHistory from "../../chat/BusinessChatHistory";

const TelegramInteractions: React.FC = () => {
  return (
    <div>
      <Alert
        icon={<IconInfoCircle size="1rem" />}
        title="Telegram Interactions"
        color="blue"
        variant="light"
        mb="md"
      >
        <Text size="sm">
          View and manage all interactions from your Telegram bot. This includes
          messages, user conversations, and engagement analytics.
        </Text>
      </Alert>

      {/* Reuse the existing ChatHistory component with Telegram-specific props */}
      <ChatHistory sourceType="telegram" showMetaInfo={false} />
    </div>
  );
};

export default TelegramInteractions;

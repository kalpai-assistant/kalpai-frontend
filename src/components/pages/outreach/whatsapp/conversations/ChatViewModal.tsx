import React, { useEffect, useRef } from "react";
import {
  Modal,
  Stack,
  Text,
  Paper,
  Group,
  Loader,
  Alert,
  ScrollArea,
} from "@mantine/core";
import { useQuery } from "react-query";
import { IconAlertCircle } from "@tabler/icons-react";
import { getChatMessages } from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";

interface ChatViewModalProps {
  sessionId: number;
  opened: boolean;
  onClose: () => void;
}

const ChatViewModal: React.FC<ChatViewModalProps> = ({
  sessionId,
  opened,
  onClose,
}) => {
  const viewport = useRef<HTMLDivElement>(null);

  // Fetch messages
  const {
    data: messagesData,
    isLoading,
    error,
  } = useQuery(
    [WhatsAppQueryNames.GET_CHAT_MESSAGES, sessionId],
    async () => {
      const response = await getChatMessages(sessionId);
      return response.data;
    },
    {
      enabled: opened,
      refetchInterval: 3000, // Poll every 3 seconds for new messages
    },
  );

  const messages = messagesData?.data || [];

  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "smooth",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Conversation - Session ${sessionId}`}
      size="lg"
      centered
    >
      <ScrollArea h={500} viewportRef={viewport}>
        <Stack gap="md">
          <>
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
              >
                Failed to load messages. Please try again.
              </Alert>
            )}

            {isLoading ? (
              <Group justify="center" p="xl">
                <Loader size="md" />
                <Text c="dimmed">Loading messages...</Text>
              </Group>
            ) : messages.length === 0 ? (
              <Paper p="xl" withBorder>
                <Text size="sm" c="dimmed" ta="center">
                  No messages yet
                </Text>
              </Paper>
            ) : (
              messages.map((message) => (
                <Group
                  key={message.message_id}
                  justify={message.role === "USER" ? "flex-end" : "flex-start"}
                >
                  <Paper
                    p="sm"
                    shadow="sm"
                    bg={message.role === "USER" ? "green.0" : "blue.0"}
                    maw="70%"
                  >
                    <Stack gap="xs">
                      <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                        {message.content}
                      </Text>
                      <Text size="xs" c="dimmed" ta="right">
                        {new Date(message.time).toLocaleString()}
                      </Text>
                    </Stack>
                  </Paper>
                </Group>
              ))
            )}
          </>
        </Stack>
      </ScrollArea>
    </Modal>
  );
};

export default ChatViewModal;

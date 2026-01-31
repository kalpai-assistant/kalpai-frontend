import React, { useState } from "react";
import {
  Paper,
  Title,
  Stack,
  Loader,
  Alert,
  Text,
  Grid,
  Group,
} from "@mantine/core";
import { useQuery } from "react-query";
import { IconAlertCircle, IconMessage } from "@tabler/icons-react";
import { getChatSessions } from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";
import ConversationCard from "./ConversationCard";
import ChatViewModal from "./ChatViewModal";

const WhatsAppConversations: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  // Fetch chat sessions
  const {
    data: sessionsData,
    isLoading,
    error,
  } = useQuery(
    WhatsAppQueryNames.GET_CHAT_SESSIONS,
    async () => {
      const response = await getChatSessions();
      return response.data;
    },
    {
      refetchInterval: 10000, // Auto-refresh every 10 seconds
    },
  );

  const sessions = sessionsData?.data || [];

  return (
    <>
      <Stack gap="md">
        <>
          <Title order={3}>AI Chat Conversations</Title>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
            >
              Failed to load conversations. Please try again.
            </Alert>
          )}

          {isLoading ? (
            <Paper p="xl" withBorder>
              <Group justify="center">
                <Loader size="md" />
                <Text c="dimmed">Loading conversations...</Text>
              </Group>
            </Paper>
          ) : sessions.length === 0 ? (
            <Paper p="xl" withBorder>
              <Stack align="center" gap="md">
                <IconMessage size={48} color="gray" />
                <Text size="lg" fw={500} c="dimmed">
                  No Conversations Yet
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  AI conversations will appear here when customers send messages
                  to your WhatsApp number.
                </Text>
              </Stack>
            </Paper>
          ) : (
            <Grid>
              {sessions.map((session) => (
                <Grid.Col key={session.session_id} span={{ base: 12, md: 6 }}>
                  <ConversationCard
                    session={session}
                    onClick={() => setSelectedSessionId(session.session_id)}
                  />
                </Grid.Col>
              ))}
            </Grid>
          )}
        </>
      </Stack>

      {selectedSessionId && (
        <ChatViewModal
          sessionId={selectedSessionId}
          opened={!!selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </>
  );
};

export default WhatsAppConversations;

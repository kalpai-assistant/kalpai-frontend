import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Modal,
  Text,
  Grid,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  getWhatsAppAccounts,
  disconnectWhatsAppAccount,
} from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";
import WhatsAppAccountCard from "./WhatsAppAccountCard";
import RequestAccountForm from "./RequestAccountForm";

const WhatsAppAccounts: React.FC = () => {
  const queryClient = useQueryClient();
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null,
  );

  // Fetch WhatsApp accounts
  const {
    data: accountsData,
    isLoading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery(
    WhatsAppQueryNames.GET_WHATSAPP_ACCOUNTS,
    async () => {
      const response = await getWhatsAppAccounts();
      return response.data;
    },
    {
      retry: 1,
    },
  );

  // Disconnect account mutation
  const disconnectMutation = useMutation(
    async (accountId: number) => {
      return disconnectWhatsAppAccount(accountId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(WhatsAppQueryNames.GET_WHATSAPP_ACCOUNTS);
        setDisconnectModalOpen(false);
        setSelectedAccountId(null);
      },
      onError: (error: any) => {
        console.error("Error disconnecting account:", error);
      },
    },
  );

  const handleActivationSuccess = () => {
    refetchAccounts();
  };

  const handleDisconnectClick = (accountId: number) => {
    setSelectedAccountId(accountId);
    setDisconnectModalOpen(true);
  };

  const handleDisconnectConfirm = () => {
    if (selectedAccountId) {
      disconnectMutation.mutate(selectedAccountId);
    }
  };

  const accounts = accountsData?.accounts || [];

  return (
    <Stack gap="md">
      <>
        {!accountsLoading && accounts.length === 0 ? (
          <RequestAccountForm onSuccess={handleActivationSuccess} />
        ) : (
          <>
            <Group justify="space-between">
              <Title order={3}>WhatsApp Accounts</Title>
            </Group>

            {accountsError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Error"
                color="red"
                variant="light"
              >
                Failed to load WhatsApp accounts. Please try again.
              </Alert>
            )}

            {accountsLoading ? (
              <Paper p="xl" withBorder>
                <Group justify="center">
                  <Loader size="md" />
                  <Text c="dimmed">Loading accounts...</Text>
                </Group>
              </Paper>
            ) : (
              <Grid>
                {accounts.map((account) => (
                  <Grid.Col key={account.id} span={{ base: 12, md: 6, lg: 4 }}>
                    <WhatsAppAccountCard
                      account={account}
                      onDisconnect={handleDisconnectClick}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            )}

            {/* Disconnect Confirmation Modal */}
            <Modal
              opened={disconnectModalOpen}
              onClose={() => setDisconnectModalOpen(false)}
              title="Disconnect WhatsApp Account"
              centered
            >
              <Stack gap="md">
                <Text>
                  Are you sure you want to disconnect this WhatsApp account?
                  This action cannot be undone.
                </Text>
                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="default"
                    onClick={() => setDisconnectModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="red"
                    onClick={handleDisconnectConfirm}
                    loading={disconnectMutation.isLoading}
                  >
                    Disconnect
                  </Button>
                </Group>
              </Stack>
            </Modal>
          </>
        )}
      </>
    </Stack>
  );
};

export default WhatsAppAccounts;

import React, { useState, useEffect } from "react";
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
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  IconMail,
  IconPlus,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import {
  getGmailAccounts,
  getGmailAuthUrl,
  disconnectGmailAccount,
  getGmailAccountStatus,
  refreshGmailAccount,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  GmailAccountStatus,
} from "../../../../../api/requests_responses/outreach/email";
import GmailAccountCard from "./GmailAccountCard";

interface AccountStatus {
  status: GmailAccountStatus;
  tokenExpiry: string | null;
  canRefresh: boolean;
}

const GmailAccounts: React.FC = () => {
  const queryClient = useQueryClient();
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<number | null>(
    null,
  );
  const [accountStatuses, setAccountStatuses] = useState<
    Record<number, AccountStatus>
  >({});
  const [refreshingAccountId, setRefreshingAccountId] = useState<number | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const {
    data: accountsResponse,
    isLoading,
    error,
  } = useQuery(EmailOutreachQueryNames.GET_GMAIL_ACCOUNTS, getGmailAccounts, {
    refetchOnWindowFocus: false,
  });

  // Fetch status for each account when accounts are loaded
  useEffect(() => {
    const fetchStatuses = async () => {
      if (!accountsResponse?.data?.accounts) return;

      const statusPromises = accountsResponse.data.accounts.map(
        async (account) => {
          try {
            const statusResponse = await getGmailAccountStatus(account.id);
            return {
              accountId: account.id,
              status: statusResponse.data,
            };
          } catch (error) {
            console.error(
              `Failed to fetch status for account ${account.id}:`,
              error,
            );
            return null;
          }
        },
      );

      const results = await Promise.all(statusPromises);
      const statusMap: Record<number, AccountStatus> = {};

      results.forEach((result) => {
        if (result) {
          statusMap[result.accountId] = {
            status: result.status.status,
            tokenExpiry: result.status.token_expiry,
            canRefresh: result.status.can_refresh,
          };
        }
      });

      setAccountStatuses(statusMap);
    };

    fetchStatuses();
  }, [accountsResponse]);

  const disconnectMutation = useMutation(
    (accountId: number) => disconnectGmailAccount(accountId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          EmailOutreachQueryNames.GET_GMAIL_ACCOUNTS,
        );
        setDisconnectModalOpen(false);
        setAccountToDisconnect(null);
        // Remove status for disconnected account
        if (accountToDisconnect) {
          const newStatuses = { ...accountStatuses };
          delete newStatuses[accountToDisconnect];
          setAccountStatuses(newStatuses);
        }
      },
    },
  );

  const refreshMutation = useMutation(
    (accountId: number) => refreshGmailAccount(accountId),
    {
      onSuccess: async (response, accountId) => {
        if (response.data.refreshed) {
          // Token refreshed successfully
          setNotification({
            message: "Account refreshed successfully!",
            type: "success",
          });
          // Refresh status
          try {
            const statusResponse = await getGmailAccountStatus(accountId);
            setAccountStatuses((prev) => ({
              ...prev,
              [accountId]: {
                status: statusResponse.data.status,
                tokenExpiry: statusResponse.data.token_expiry,
                canRefresh: statusResponse.data.can_refresh,
              },
            }));
          } catch (error) {
            console.error("Failed to refresh status after refresh:", error);
          }
          queryClient.invalidateQueries(
            EmailOutreachQueryNames.GET_GMAIL_ACCOUNTS,
          );
        } else {
          // Need to redirect to OAuth URL
          if (response.data.auth_url) {
            window.location.href = response.data.auth_url;
          } else {
            setNotification({
              message: response.data.message || "Failed to refresh account",
              type: "error",
            });
          }
        }
        setRefreshingAccountId(null);
      },
      onError: (error: any) => {
        setNotification({
          message:
            error?.response?.data?.message ||
            "Failed to refresh account. Please try again.",
          type: "error",
        });
        setRefreshingAccountId(null);
      },
    },
  );

  const handleConnectGmail = async () => {
    try {
      // Backend generates state and stores business_id in Redis
      // No need to pass state or store it on frontend
      const response = await getGmailAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
    }
  };

  const handleDisconnectClick = (accountId: number) => {
    setAccountToDisconnect(accountId);
    setDisconnectModalOpen(true);
  };

  const handleDisconnectConfirm = () => {
    if (accountToDisconnect) {
      disconnectMutation.mutate(accountToDisconnect);
    }
  };

  const handleRefresh = (accountId: number) => {
    setRefreshingAccountId(accountId);
    refreshMutation.mutate(accountId);
  };

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Failed to load Gmail accounts. Please try again.
      </Alert>
    );
  }

  const accounts = accountsResponse?.data?.accounts || [];

  return (
    <>
      <Stack gap="md">
        {notification && (
          <Alert
            icon={
              notification.type === "success" ? (
                <IconCheck size={16} />
              ) : (
                <IconAlertCircle size={16} />
              )
            }
            title={notification.type === "success" ? "Success" : "Error"}
            color={notification.type === "success" ? "green" : "red"}
            onClose={() => setNotification(null)}
            withCloseButton
          >
            {notification.message}
          </Alert>
        )}

        <Group justify="space-between" align="center">
          <Title order={3}>Gmail Accounts</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleConnectGmail}
          >
            Connect Gmail Account
          </Button>
        </Group>

        {accounts.length === 0 ? (
          <Paper p="xl" shadow="sm" withBorder>
            <Stack align="center" gap="md">
              <IconMail size={48} color="gray" />
              <Text size="lg" c="dimmed" ta="center">
                No Gmail accounts connected
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Connect a Gmail account to start sending email campaigns
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleConnectGmail}
              >
                Connect Your First Account
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Group>
            {accounts.map((account) => {
              const accountStatus = accountStatuses[account.id];
              return (
                <GmailAccountCard
                  key={account.id}
                  account={account}
                  status={accountStatus?.status}
                  tokenExpiry={accountStatus?.tokenExpiry}
                  isRefreshing={refreshingAccountId === account.id}
                  onDisconnect={handleDisconnectClick}
                  onRefresh={handleRefresh}
                />
              );
            })}
          </Group>
        )}
      </Stack>

      <Modal
        opened={disconnectModalOpen}
        onClose={() => setDisconnectModalOpen(false)}
        title="Disconnect Gmail Account"
      >
        <Text mb="md">
          Are you sure you want to disconnect this Gmail account? You won't be
          able to send emails from this account until you reconnect it.
        </Text>
        <Group justify="flex-end">
          <Button
            variant="subtle"
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
      </Modal>
    </>
  );
};

export default GmailAccounts;

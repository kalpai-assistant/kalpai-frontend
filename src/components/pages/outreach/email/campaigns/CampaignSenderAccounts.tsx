import React, { useState, useEffect, useMemo } from "react";
import {
  Stack,
  Group,
  Text,
  Button,
  Card,
  Select,
  NumberInput,
  Badge,
  Alert,
  ActionIcon,
  Divider,
  Paper,
  Loader,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getGmailAccounts,
  getGmailAccountStats,
  getCampaignGmailAccounts,
  addCampaignGmailAccount,
  removeCampaignGmailAccount,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignGmailAccount,
  GmailAccountStats,
} from "../../../../../api/requests_responses/outreach/email";

interface CampaignSenderAccountsProps {
  campaignId?: number; // Optional: for editing existing campaigns
  onAccountsChange?: (accounts: CampaignGmailAccount[]) => void; // For creation flow
  isCreationMode?: boolean; // true = creation, false = edit
}

const CampaignSenderAccounts: React.FC<CampaignSenderAccountsProps> = ({
  campaignId,
  onAccountsChange,
  isCreationMode = false,
}) => {
  const queryClient = useQueryClient();
  const [selectedAccounts, setSelectedAccounts] = useState<
    CampaignGmailAccount[]
  >([]);
  const [selectedGmailId, setSelectedGmailId] = useState<string | null>(null);
  const [dailyLimit, setDailyLimit] = useState<number>(500);
  const [priority, setPriority] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [accountStats, setAccountStats] = useState<
    Record<number, GmailAccountStats>
  >({});

  // Fetch available Gmail accounts
  const { data: gmailAccountsData, isLoading: loadingAccounts } = useQuery(
    EmailOutreachQueryNames.GET_GMAIL_ACCOUNTS,
    getGmailAccounts,
  );

  // Fetch campaign's existing accounts (edit mode only)
  const { isLoading: loadingCampaignAccounts } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGN_GMAIL_ACCOUNTS, campaignId],
    () => getCampaignGmailAccounts(campaignId!),
    {
      onSuccess: (response) => {
        if (response.data) {
          setSelectedAccounts(response.data || []);
        }
      },
      enabled: !isCreationMode && !!campaignId,
    },
  );

  // Notify parent about account changes (creation mode)
  useEffect(() => {
    if (isCreationMode && onAccountsChange) {
      // In creation mode, we pass simplified data
      const accounts = selectedAccounts.map((acc, idx) => ({
        id: idx, // Temporary ID
        campaign_id: 0, // Not yet created
        gmail_account_id: acc.gmail_account_id,
        gmail_address: acc.gmail_address,
        daily_limit: acc.daily_limit,
        priority: acc.priority,
      })) as CampaignGmailAccount[];
      onAccountsChange(accounts);
    }
  }, [selectedAccounts, isCreationMode, onAccountsChange]);

  // Fetch stats for a specific account
  const fetchAccountStats = async (accountId: number) => {
    try {
      const response = await getGmailAccountStats(accountId, false);
      setAccountStats((prev) => ({
        ...prev,
        [accountId]: response.data,
      }));
    } catch (err) {
      console.error("Failed to fetch account stats:", err);
    }
  };

  // Add mutation (edit mode)
  const addMutation = useMutation(
    (data: {
      gmail_account_id: number;
      daily_limit: number;
      priority: number;
    }) => addCampaignGmailAccount(campaignId!, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_GMAIL_ACCOUNTS,
          campaignId,
        ]);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        setSelectedGmailId(null);
        setDailyLimit(500);
        setPriority(1);
        setError("");
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.detail ||
            "Failed to add account. Please try again.",
        );
      },
    },
  );

  // Remove mutation (edit mode)
  const removeMutation = useMutation(
    (mappingId: number) => removeCampaignGmailAccount(campaignId!, mappingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_GMAIL_ACCOUNTS,
          campaignId,
        ]);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.detail ||
            "Failed to remove account. Please try again.",
        );
      },
    },
  );

  const handleAddAccount = async () => {
    if (!selectedGmailId) {
      setError("Please select a Gmail account");
      return;
    }

    const accountId = parseInt(selectedGmailId);
    const account = gmailAccountsData?.data?.accounts.find(
      (acc) => acc.id === accountId,
    );

    if (!account) {
      setError("Account not found");
      return;
    }

    // Check if account already added
    if (selectedAccounts.some((acc) => acc.gmail_account_id === accountId)) {
      setError("This account is already added");
      return;
    }

    // Fetch stats to validate
    const stats = accountStats[accountId];
    if (stats && dailyLimit > stats.available) {
      setError(
        `Daily limit (${dailyLimit}) exceeds available capacity (${stats.available})`,
      );
      return;
    }

    if (isCreationMode) {
      // Creation mode: add to local state
      setSelectedAccounts([
        ...selectedAccounts,
        {
          id: 0,
          campaign_id: 0,
          gmail_account_id: accountId,
          gmail_address: account.gmail_address,
          daily_limit: dailyLimit,
          priority: priority,
          is_active: true,
          current_sent: 0,
          available: dailyLimit,
        },
      ]);
      setSelectedGmailId(null);
      setDailyLimit(500);
      setPriority(1);
      setError("");
    } else {
      // Edit mode: call API
      addMutation.mutate({
        gmail_account_id: accountId,
        daily_limit: dailyLimit,
        priority: priority,
      });
    }
  };

  const handleRemoveAccount = (gmailAccountId: number) => {
    if (isCreationMode) {
      // Creation mode: remove from local state
      setSelectedAccounts(
        selectedAccounts.filter(
          (acc) => acc.gmail_account_id !== gmailAccountId,
        ) as CampaignGmailAccount[],
      );
    } else {
      // Edit mode: find mapping ID and call API
      const mapping = selectedAccounts.find(
        (acc) => acc.gmail_account_id === gmailAccountId,
      );
      if (mapping) {
        removeMutation.mutate(mapping.id);
      }
    }
  };

  const handleAccountSelect = (value: string | null) => {
    setSelectedGmailId(value);
    if (value) {
      const accountId = parseInt(value);
      fetchAccountStats(accountId);

      // Find the account to get suggested limit
      const account = gmailAccountsData?.data?.accounts.find(
        (acc) => acc.id === accountId,
      );
      if (account) {
        // Suggest a reasonable default based on account's daily send limit
        const suggestedLimit = Math.min(500, account.daily_send_limit);
        setDailyLimit(suggestedLimit);
      }
    }
  };

  const accountOptions = useMemo(() => {
    if (!gmailAccountsData?.data?.accounts) return [];

    const usedIds = new Set([
      ...selectedAccounts.map((acc) => acc.gmail_account_id),
    ]);

    return gmailAccountsData.data.accounts
      .filter((acc) => acc.is_connected && !usedIds.has(acc.id))
      .map((acc) => ({
        value: String(acc.id),
        label: acc.gmail_address,
      }));
  }, [gmailAccountsData, selectedAccounts]);

  const getTotalCapacity = () => {
    const creationTotal = selectedAccounts.reduce(
      (sum, acc) => sum + acc.daily_limit,
      0,
    );
    const editTotal =
      selectedAccounts.reduce((sum, acc) => sum + acc.daily_limit, 0) || 0;
    return isCreationMode ? creationTotal : editTotal;
  };

  const getTotalAvailable = () => {
    if (isCreationMode) {
      return selectedAccounts.reduce((sum, acc) => sum + acc.daily_limit, 0);
    }
    return selectedAccounts.reduce((sum, acc) => sum + acc.available, 0) || 0;
  };

  if (loadingAccounts || loadingCampaignAccounts) {
    return (
      <Paper p="md" withBorder>
        <Group>
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading accounts...
          </Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <div>
          <Text fw={600} size="md">
            Sender Accounts
          </Text>
          <Text size="sm" c="dimmed">
            Add multiple Gmail accounts to increase sending capacity
          </Text>
        </div>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            withCloseButton
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Display selected accounts */}
        {selectedAccounts.length > 0 && (
          <Stack gap="xs">
            {selectedAccounts.map((acc) => {
              const accountId = acc.gmail_account_id;
              const address = acc.gmail_address;
              const limit = acc.daily_limit;
              const prio = acc.priority;
              const available = acc.available;
              const currentSent = acc.current_sent;

              return (
                <Card key={accountId} withBorder padding="sm">
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Group gap="xs">
                        <Text fw={600} size="sm">
                          {address}
                        </Text>
                        <Badge size="xs" color="blue">
                          Priority: {prio}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Daily Limit: {limit.toLocaleString()} | Available:{" "}
                        {available.toLocaleString()}
                        {!isCreationMode &&
                          ` | Sent Today: ${currentSent.toLocaleString()}`}
                      </Text>
                    </Stack>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleRemoveAccount(accountId)}
                      disabled={
                        isCreationMode ? false : removeMutation.isLoading
                      }
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}

        {selectedAccounts.length === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="blue">
            No sender accounts added yet. Add at least one Gmail account to send
            emails.
          </Alert>
        )}

        <Divider label="Add New Account" labelPosition="center" />

        {/* Add account form */}
        <Stack gap="sm">
          <Select
            label="Gmail Account"
            placeholder="Select an account"
            data={accountOptions}
            value={selectedGmailId}
            onChange={handleAccountSelect}
            searchable
            key={`select-${accountOptions.length}`}
          />

          {selectedGmailId && accountStats[parseInt(selectedGmailId)] && (
            <Card withBorder padding="md" bg="blue.0">
              <Stack gap="xs">
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600} c="blue.7">
                    Account Usage Stats
                  </Text>
                  <Badge
                    size="sm"
                    variant="light"
                    color={
                      accountStats[parseInt(selectedGmailId)].account_type ===
                      "workspace"
                        ? "violet"
                        : "cyan"
                    }
                  >
                    {accountStats[parseInt(selectedGmailId)].account_type ===
                    "workspace"
                      ? "Workspace"
                      : "Free"}
                  </Badge>
                </Group>

                <Group gap="lg" wrap="wrap">
                  {/* Today's Sent */}
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                      Sent Today
                    </Text>
                    <Text size="lg" fw={700} c="blue.7">
                      {accountStats[
                        parseInt(selectedGmailId)
                      ].daily_sent_count.toLocaleString()}
                    </Text>
                  </div>

                  {/* Campaigns Using (optional) */}
                  {accountStats[parseInt(selectedGmailId)]
                    .total_campaigns_using !== undefined && (
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                        Campaigns Using
                      </Text>
                      <Text size="lg" fw={700} c="orange.7">
                        {
                          accountStats[parseInt(selectedGmailId)]
                            .total_campaigns_using
                        }
                      </Text>
                    </div>
                  )}

                  {/* Total Configured (optional) */}
                  {accountStats[parseInt(selectedGmailId)]
                    .total_daily_limits_sum !== undefined && (
                    <div>
                      <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                        Total Configured
                      </Text>
                      <Text size="lg" fw={700} c="red.7">
                        {accountStats[
                          parseInt(selectedGmailId)
                        ].total_daily_limits_sum!.toLocaleString()}
                      </Text>
                    </div>
                  )}
                </Group>

                {/* Warning if over-allocated */}
                {accountStats[parseInt(selectedGmailId)]
                  .total_daily_limits_sum !== undefined &&
                  accountStats[parseInt(selectedGmailId)]
                    .total_daily_limits_sum! >
                    accountStats[parseInt(selectedGmailId)].max_daily_limit && (
                    <Alert color="orange" variant="light" p="xs">
                      <Text size="xs">
                        ⚠️ This account is over-allocated! Configured:{" "}
                        {accountStats[
                          parseInt(selectedGmailId)
                        ].total_daily_limits_sum!.toLocaleString()}{" "}
                        / Max:{" "}
                        {accountStats[
                          parseInt(selectedGmailId)
                        ].max_daily_limit.toLocaleString()}
                      </Text>
                    </Alert>
                  )}
              </Stack>
            </Card>
          )}

          <Group grow>
            <NumberInput
              label="Daily Limit"
              description="Max emails per day from this account"
              placeholder={
                selectedGmailId &&
                accountStats[parseInt(selectedGmailId)]
                  ?.total_daily_limits_sum !== undefined
                  ? String(
                      Math.max(
                        0,
                        accountStats[parseInt(selectedGmailId)]
                          .max_daily_limit -
                          accountStats[parseInt(selectedGmailId)]
                            .total_daily_limits_sum!,
                      ),
                    )
                  : "500"
              }
              value={dailyLimit}
              onChange={(value) => setDailyLimit(Number(value))}
              min={1}
              max={10000}
              step={50}
            />
            <NumberInput
              label="Priority"
              description="1 = highest, used for distribution"
              placeholder="1"
              value={priority}
              onChange={(value) => setPriority(Number(value) || 1)}
              min={1}
              max={10}
            />
          </Group>

          {/* Over-allocation Warning */}
          {selectedGmailId &&
            accountStats[parseInt(selectedGmailId)] &&
            (() => {
              const stats = accountStats[parseInt(selectedGmailId)];
              const currentTotal = stats.total_daily_limits_sum || 0;
              const maxLimit = stats.max_daily_limit;

              // Creation mode: Check if adding this limit would exceed capacity
              if (isCreationMode) {
                const wouldExceed = dailyLimit + currentTotal > maxLimit;
                const newTotal = dailyLimit + currentTotal;

                if (wouldExceed) {
                  return (
                    <Alert
                      color="orange"
                      variant="light"
                      icon={<IconAlertCircle size={16} />}
                    >
                      <Stack gap={4}>
                        <Text size="sm" fw={600}>
                          ⚠️ This will over-allocate the account
                        </Text>
                        <Text size="xs">
                          Adding {dailyLimit.toLocaleString()} would bring total
                          to{" "}
                          <Text component="span" fw={700} c="orange.8">
                            {newTotal.toLocaleString()}
                          </Text>
                          , exceeding the account's max limit of{" "}
                          {maxLimit.toLocaleString()}. The account may not be
                          able to send all configured emails.
                        </Text>
                      </Stack>
                    </Alert>
                  );
                }
              } else {
                // Edit mode: Check if account is already over-allocated
                const isOverAllocated = currentTotal > maxLimit;

                if (isOverAllocated) {
                  return (
                    <Alert
                      color="red"
                      variant="light"
                      icon={<IconAlertCircle size={16} />}
                    >
                      <Stack gap={4}>
                        <Text size="sm" fw={600}>
                          ⚠️ This account is already over-allocated
                        </Text>
                        <Text size="xs">
                          Total configured: {currentTotal.toLocaleString()}{" "}
                          exceeds max limit of {maxLimit.toLocaleString()}.
                          Consider reducing limits across campaigns or using
                          additional accounts to avoid delivery issues.
                        </Text>
                      </Stack>
                    </Alert>
                  );
                }
              }

              return null;
            })()}

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddAccount}
            disabled={!selectedGmailId}
            loading={!isCreationMode && addMutation.isLoading}
          >
            Add Account
          </Button>
        </Stack>

        {/* Total capacity summary */}
        {selectedGmailId && selectedAccounts.length > 0 && (
          <>
            <Divider />
            <Alert icon={<IconCheck size={16} />} color="blue">
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="sm">
                    Total Campaign Capacity
                  </Text>
                  <Text size="xs">
                    {selectedAccounts.length} account
                    {selectedAccounts.length > 1 ? "s" : ""}
                  </Text>
                </div>
                <div style={{ textAlign: "right" }}>
                  <Text fw={600} size="lg">
                    {getTotalAvailable().toLocaleString()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    / {getTotalCapacity().toLocaleString()} per day
                  </Text>
                </div>
              </Group>
            </Alert>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default CampaignSenderAccounts;

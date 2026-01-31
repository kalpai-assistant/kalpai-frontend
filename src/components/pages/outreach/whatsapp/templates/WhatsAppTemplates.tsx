import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Select,
  Text,
  Grid,
} from "@mantine/core";
import { useQuery } from "react-query";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import {
  getWhatsAppAccounts,
  getTemplates,
} from "../../../../../api/outreach/whatsapp";
import { WhatsAppQueryNames } from "../../../../../api/requests_responses/outreach/whatsapp";
import WhatsAppTemplateCard from "./WhatsAppTemplateCard";
import CreateTemplateModal from "./CreateTemplateModal";

const WhatsAppTemplates: React.FC = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch WhatsApp accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery(
    WhatsAppQueryNames.GET_WHATSAPP_ACCOUNTS,
    async () => {
      const response = await getWhatsAppAccounts();
      return response.data;
    },
  );

  // Fetch templates for selected account
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
  } = useQuery(
    [WhatsAppQueryNames.GET_TEMPLATES, selectedAccountId],
    async () => {
      if (!selectedAccountId) return null;
      const response = await getTemplates(parseInt(selectedAccountId));
      return response.data;
    },
    {
      enabled: !!selectedAccountId,
      retry: 1,
    },
  );

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const accounts = accountsData?.accounts || [];
  const templates = templatesData?.templates || [];

  const filteredTemplates = templates.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  // Auto-select first account if available and none selected
  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts.length, selectedAccountId]);

  if (accountsLoading) {
    return (
      <Paper p="xl" withBorder>
        <Group justify="center">
          <Loader size="md" />
          <Text c="dimmed">Loading accounts...</Text>
        </Group>
      </Paper>
    );
  }

  if (accounts.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Stack align="center" gap="md">
          <Text size="lg" fw={500} c="dimmed">
            No WhatsApp Accounts Connected
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Please connect a WhatsApp account first to manage templates.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <>
        <Group justify="space-between">
          <Title order={3}>Message Templates</Title>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => setCreateModalOpen(true)}
            disabled={!selectedAccountId}
            color="green"
          >
            Create Template
          </Button>
        </Group>

        <Group>
          <Select
            label="WhatsApp Account"
            placeholder="Select account"
            value={selectedAccountId}
            onChange={setSelectedAccountId}
            data={accounts.map((acc) => ({
              value: acc.id.toString(),
              label: `${acc.phone_number} - ${acc.display_name}`,
            }))}
            style={{ flex: 1 }}
          />
          <Select
            label="Status Filter"
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "ALL")}
            data={[
              { value: "ALL", label: "All Statuses" },
              { value: "APPROVED", label: "Approved" },
              { value: "PENDING", label: "Pending" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
        </Group>

        {templatesError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            Failed to load templates. Please try again.
          </Alert>
        )}

        {templatesLoading ? (
          <Paper p="xl" withBorder>
            <Group justify="center">
              <Loader size="md" />
              <Text c="dimmed">Loading templates...</Text>
            </Group>
          </Paper>
        ) : filteredTemplates.length === 0 ? (
          <Paper p="xl" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" fw={500} c="dimmed">
                No Templates Found
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                {statusFilter !== "ALL"
                  ? `No templates found with status "${statusFilter}".`
                  : "Create your first message template to use in campaigns."}
              </Text>
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setCreateModalOpen(true)}
                color="green"
                size="md"
              >
                Create Template
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Grid>
            {filteredTemplates.map((template) => (
              <Grid.Col key={template.id} span={{ base: 12, md: 6 }}>
                <WhatsAppTemplateCard template={template} />
              </Grid.Col>
            ))}
          </Grid>
        )}

        {selectedAccountId && (
          <CreateTemplateModal
            opened={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            accountId={parseInt(selectedAccountId)}
          />
        )}
      </>
    </Stack>
  );
};

export default WhatsAppTemplates;

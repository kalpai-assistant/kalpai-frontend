import React, { useState } from "react";
import {
  Stack,
  Table,
  Text,
  Badge,
  Group,
  Button,
  Pagination,
  Alert,
  Loader,
  Select,
  Checkbox,
  ActionIcon,
  Modal,
  TextInput,
  Paper,
  Divider,
  MultiSelect,
  SegmentedControl,
  Card,
  Collapse,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconAlertCircle,
  IconCheck,
  IconChevronUp,
} from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getCampaignEmails,
  updateCampaignEmail,
  deleteCampaignEmail,
  bulkDeleteCampaignEmails,
  addCampaignEmails,
  getEmailLists,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  CampaignEmail,
  EmailStatus,
} from "../../../../../api/requests_responses/outreach/email";
import { PageSizes } from "../../../../../utils/constants";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ManualEmail {
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
}

interface CampaignEmailsListProps {
  campaignId: number;
  onAddEmailsClick: () => void;
}

type RecipientMode = "multi-list" | "manual";

// ============================================================================
// Main Component
// ============================================================================

const CampaignEmailsList: React.FC<CampaignEmailsListProps> = ({
  campaignId,
  onAddEmailsClick,
}) => {
  const queryClient = useQueryClient();

  // ------------------------------------------------------------
  // State - Email List Management
  // ------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);

  // ------------------------------------------------------------
  // State - Edit Modal
  // ------------------------------------------------------------
  const [editingEmail, setEditingEmail] = useState<CampaignEmail | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    company_name: "",
    location: "",
    phone_number: "",
  });

  // ------------------------------------------------------------
  // State - Add Emails Section
  // ------------------------------------------------------------
  const [showAddSection, setShowAddSection] = useState(false);
  const [recipientMode, setRecipientMode] =
    useState<RecipientMode>("multi-list");
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<ManualEmail[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------------------------------
  // State - Messages
  // ------------------------------------------------------------
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: emailsResponse, isLoading } = useQuery(
    [
      EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
      campaignId,
      page,
      statusFilter,
    ],
    () =>
      getCampaignEmails(campaignId, {
        page,
        limit: PageSizes.CHAT_HISTORY,
        status: statusFilter || undefined,
      }),
    {
      enabled: !!campaignId,
      refetchOnWindowFocus: false,
    },
  );

  const { data: listsResponse, isLoading: loadingLists } = useQuery(
    EmailOutreachQueryNames.GET_EMAIL_LISTS,
    getEmailLists,
    {
      enabled: showAddSection,
      refetchOnWindowFocus: false,
    },
  );

  // ============================================================================
  // Mutations
  // ============================================================================

  const updateMutation = useMutation(
    (data: { emailId: number; updates: any }) =>
      updateCampaignEmail(campaignId, data.emailId, data.updates),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
          campaignId,
        ]);
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          campaignId,
        ]);
        setSuccessMessage("Email updated successfully");
        setEditingEmail(null);
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to update email",
        );
      },
    },
  );

  const deleteMutation = useMutation(
    (emailId: number) => deleteCampaignEmail(campaignId, emailId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
          campaignId,
        ]);
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          campaignId,
        ]);
        setSuccessMessage("Email deleted successfully");
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to delete email",
        );
      },
    },
  );

  const bulkDeleteMutation = useMutation(
    (emailIds: number[]) =>
      bulkDeleteCampaignEmails(campaignId, { email_ids: emailIds }),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
          campaignId,
        ]);
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          campaignId,
        ]);
        setSuccessMessage(
          `${response.data.deleted} email(s) deleted successfully`,
        );
        setSelectedEmails([]);
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to delete emails",
        );
      },
    },
  );

  // ============================================================================
  // Handlers - Email List Management
  // ============================================================================

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(emails.map((email) => email.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (emailId: number, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter((id) => id !== emailId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedEmails.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedEmails.length} email(s)?`,
      )
    ) {
      bulkDeleteMutation.mutate(selectedEmails);
    }
  };

  // ============================================================================
  // Handlers - Edit Modal
  // ============================================================================

  const handleEditClick = (email: CampaignEmail) => {
    setEditingEmail(email);
    setEditForm({
      name: email.name || "",
      company_name: email.company_name || "",
      location: email.location || "",
      phone_number: email.phone_number || "",
    });
  };

  const handleSaveEdit = () => {
    if (!editingEmail) return;
    updateMutation.mutate({
      emailId: editingEmail.id,
      updates: editForm,
    });
  };

  const handleDeleteClick = (emailId: number) => {
    if (window.confirm("Are you sure you want to delete this email?")) {
      deleteMutation.mutate(emailId);
    }
  };

  // ============================================================================
  // Handlers - Add Emails
  // ============================================================================

  const handleAddManualEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Invalid email address format");
      return;
    }

    if (manualEmails.some((e) => e.email === trimmedEmail)) {
      setErrorMessage("This email has already been added");
      return;
    }

    const newEmail: ManualEmail = {
      email: trimmedEmail,
      name: nameInput.trim() || undefined,
      company_name: companyInput.trim() || undefined,
    };

    setManualEmails([...manualEmails, newEmail]);
    setErrorMessage("");
    setEmailInput("");
    setNameInput("");
    setCompanyInput("");
  };

  const handleRemoveManualEmail = (index: number) => {
    setManualEmails(manualEmails.filter((_, i) => i !== index));
  };

  const handleSubmitEmails = async () => {
    if (recipientMode === "multi-list") {
      if (selectedListIds.length === 0) {
        setErrorMessage("Please select at least one email list");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        let totalAdded = 0;
        let totalDuplicates = 0;

        for (const listId of selectedListIds) {
          const response = await addCampaignEmails(campaignId, {
            source: "list",
            email_list_id: parseInt(listId),
          });
          totalAdded += response.data.added;
          totalDuplicates += response.data.duplicates;
        }

        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
          campaignId,
        ]);
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          campaignId,
        ]);

        const message = `Added ${totalAdded} email(s) from ${
          selectedListIds.length
        } list(s).${
          totalDuplicates > 0 ? ` ${totalDuplicates} duplicate(s) skipped.` : ""
        }`;
        setSuccessMessage(message);
        setSelectedListIds([]);
        setShowAddSection(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to add emails from lists",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Manual emails
      if (manualEmails.length === 0) {
        setErrorMessage("Please add at least one email");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage("");

      try {
        const response = await addCampaignEmails(campaignId, {
          source: "manual",
          emails: manualEmails,
        });

        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN_EMAILS,
          campaignId,
        ]);
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          campaignId,
        ]);

        const message = `Added ${response.data.added} email(s).${
          response.data.duplicates > 0
            ? ` ${response.data.duplicates} duplicate(s) skipped.`
            : ""
        }`;
        setSuccessMessage(message);
        setManualEmails([]);
        setShowAddSection(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error: any) {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to add manual emails",
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const getStatusColor = (status: EmailStatus) => {
    const colorMap: Record<EmailStatus, string> = {
      [EmailStatus.SENT]: "green",
      [EmailStatus.PENDING]: "blue",
      [EmailStatus.FAILED]: "red",
      [EmailStatus.BOUNCED]: "orange",
      [EmailStatus.SKIPPED]: "gray",
    };
    return colorMap[status] || "gray";
  };

  const canEditEmail = (email: CampaignEmail) => {
    return email.status === EmailStatus.PENDING;
  };

  const canDeleteEmail = (email: CampaignEmail) => {
    return email.status !== EmailStatus.SENT;
  };

  const getTotalRecipients = () => {
    if (recipientMode === "multi-list") {
      let total = 0;
      selectedListIds.forEach((id) => {
        const selected = listOptions.find((opt) => opt.value === id);
        if (selected) {
          const match = selected.label.match(/\((\d+) contacts\)/);
          if (match) total += parseInt(match[1]);
        }
      });
      return total;
    } else if (recipientMode === "manual") {
      return manualEmails.length;
    }
    return 0;
  };

  // ============================================================================
  // Derived Data
  // ============================================================================

  const emails = emailsResponse?.data?.emails || [];
  const total = emailsResponse?.data?.total || 0;
  const totalPages = Math.ceil(total / PageSizes.CHAT_HISTORY);

  const lists = listsResponse?.data?.email_lists || [];
  const listOptions = lists.map((list) => ({
    value: String(list.id),
    label: `${list.name} (${list.total_contacts} contacts)`,
  }));

  const totalNewRecipients = getTotalRecipients();

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading emails...
        </Text>
      </Group>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Stack gap="md">
      {/* Error/Success Messages */}
      {errorMessage && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          withCloseButton
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert
          icon={<IconCheck size={16} />}
          color="green"
          withCloseButton
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      {/* Controls */}
      <Group justify="space-between">
        <Group justify="flex-start">
          <Select
            placeholder="Filter by status"
            data={[
              { value: "pending", label: "Pending" },
              { value: "sent", label: "Sent" },
              { value: "failed", label: "Failed" },
              { value: "bounced", label: "Bounced" },
              { value: "skipped", label: "Skipped" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            style={{ width: 200 }}
          />
          {selectedEmails.length > 0 && (
            <Button
              color="red"
              variant="light"
              leftSection={<IconTrash size={16} />}
              onClick={handleBulkDelete}
              loading={bulkDeleteMutation.isLoading}
            >
              Delete {selectedEmails.length} Selected
            </Button>
          )}
        </Group>
        <Button
          leftSection={
            showAddSection ? (
              <IconChevronUp size={16} />
            ) : (
              <IconPlus size={16} />
            )
          }
          onClick={() => setShowAddSection(!showAddSection)}
        >
          {showAddSection ? "Hide Add Emails" : "Add Emails"}
        </Button>
      </Group>

      {/* Add Emails Section */}
      <Collapse in={showAddSection}>
        <Paper p="md" withBorder style={{ backgroundColor: "#f8f9fa" }}>
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb="xs">
                Add Recipients
              </Text>
              <SegmentedControl
                value={recipientMode}
                onChange={(value) => setRecipientMode(value as RecipientMode)}
                data={[
                  { value: "multi-list", label: "Multiple Lists" },
                  { value: "manual", label: "Manual Input" },
                ]}
                fullWidth
              />
            </div>

            {recipientMode === "multi-list" ? (
              <Stack gap="md">
                {loadingLists ? (
                  <Group justify="center" p="md">
                    <Loader size="sm" />
                    <Text size="sm" c="dimmed">
                      Loading lists...
                    </Text>
                  </Group>
                ) : (
                  <>
                    <MultiSelect
                      label="Email Lists"
                      placeholder="Select multiple email lists"
                      data={listOptions}
                      value={selectedListIds}
                      onChange={setSelectedListIds}
                      searchable
                      clearable
                      disabled={listOptions.length === 0}
                      description="Emails will be automatically deduplicated"
                    />
                    {listOptions.length === 0 && (
                      <Alert
                        color="yellow"
                        icon={<IconAlertCircle size={16} />}
                      >
                        No email lists available. Please create a list first.
                      </Alert>
                    )}
                    {selectedListIds.length === 0 && (
                      <Alert color="blue" icon={<IconAlertCircle size={16} />}>
                        Please select at least one email list
                      </Alert>
                    )}
                    {totalNewRecipients > 0 && (
                      <Alert color="green" variant="light">
                        <Text size="sm" fw={500}>
                          Total Recipients:{" "}
                          {totalNewRecipients.toLocaleString()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Duplicates will be automatically removed
                        </Text>
                      </Alert>
                    )}
                  </>
                )}
              </Stack>
            ) : (
              <Stack gap="md">
                <Alert color="blue" variant="light">
                  <Text size="sm">
                    Add emails manually. You can add as many as needed, and
                    they'll be automatically deduplicated.
                  </Text>
                </Alert>

                <Card withBorder padding="md">
                  <Stack gap="sm">
                    <TextInput
                      label="Email Address"
                      placeholder="contact@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddManualEmail();
                        }
                      }}
                    />
                    <Group grow>
                      <TextInput
                        label="Name (Optional)"
                        placeholder="John Doe"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                      />
                      <TextInput
                        label="Company (Optional)"
                        placeholder="Acme Inc"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                      />
                    </Group>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddManualEmail}
                      disabled={!emailInput.trim()}
                      variant="light"
                    >
                      Add Email
                    </Button>
                  </Stack>
                </Card>

                {manualEmails.length > 0 && (
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Emails to Add ({manualEmails.length})
                    </Text>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {manualEmails.map((email, index) => (
                        <Card key={index} withBorder padding="sm" mb="xs">
                          <Group justify="space-between" wrap="nowrap">
                            <div style={{ flex: 1 }}>
                              <Text size="sm" fw={500}>
                                {email.email}
                              </Text>
                              {(email.name || email.company_name) && (
                                <Text size="xs" c="dimmed">
                                  {[email.name, email.company_name]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </Text>
                              )}
                            </div>
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => handleRemoveManualEmail(index)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Card>
                      ))}
                    </div>
                  </Stack>
                )}

                {manualEmails.length === 0 && (
                  <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                    No emails added yet. Please add at least one email.
                  </Alert>
                )}
              </Stack>
            )}

            <Group justify="flex-end">
              <Button
                variant="subtle"
                onClick={() => setShowAddSection(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitEmails}
                loading={isSubmitting}
                disabled={
                  (recipientMode === "multi-list" &&
                    selectedListIds.length === 0) ||
                  (recipientMode === "manual" && manualEmails.length === 0)
                }
              >
                Add Emails to Campaign
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      <Divider />

      {/* Stats */}
      <Paper p="md" withBorder>
        <Group>
          <div>
            <Text size="sm" c="dimmed">
              Total Emails
            </Text>
            <Text size="lg" fw={700}>
              {total.toLocaleString()}
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Emails Table */}
      {emails.length === 0 ? (
        <Alert icon={<IconAlertCircle size={16} />} color="blue">
          No emails found. "Click 'Add Emails' to add recipients to this
          campaign."
        </Alert>
      ) : (
        <>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={
                      selectedEmails.length === emails.length &&
                      emails.length > 0
                    }
                    indeterminate={
                      selectedEmails.length > 0 &&
                      selectedEmails.length < emails.length
                    }
                    onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                  />
                </Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Company</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Sent At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {emails.map((email) => (
                <Table.Tr key={email.id}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) =>
                        handleSelectEmail(email.id, e.currentTarget.checked)
                      }
                      disabled={!canDeleteEmail(email)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {email.email}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{email.name || "-"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{email.company_name || "-"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getStatusColor(email.status)}
                      variant="light"
                      size="sm"
                    >
                      {email.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {email.sent_at
                        ? new Date(email.sent_at).toLocaleString()
                        : "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {canEditEmail(email) && (
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleEditClick(email)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                      {canDeleteEmail(email) && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteClick(email.id)}
                          loading={deleteMutation.isLoading}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              mt="md"
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal
        opened={!!editingEmail}
        onClose={() => setEditingEmail(null)}
        title="Edit Email Details"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Email Address"
            value={editingEmail?.email || ""}
            disabled
          />
          <TextInput
            label="Name"
            placeholder="John Doe"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          />
          <TextInput
            label="Company"
            placeholder="Acme Inc"
            value={editForm.company_name}
            onChange={(e) =>
              setEditForm({ ...editForm, company_name: e.target.value })
            }
          />
          <TextInput
            label="Location"
            placeholder="New York, USA"
            value={editForm.location}
            onChange={(e) =>
              setEditForm({ ...editForm, location: e.target.value })
            }
          />
          <TextInput
            label="Phone Number"
            placeholder="+1234567890"
            value={editForm.phone_number}
            onChange={(e) =>
              setEditForm({ ...editForm, phone_number: e.target.value })
            }
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              onClick={() => setEditingEmail(null)}
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} loading={updateMutation.isLoading}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default CampaignEmailsList;

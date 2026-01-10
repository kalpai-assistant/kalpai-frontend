import React, { useState } from "react";
import {
  Modal,
  Stack,
  SegmentedControl,
  Select,
  TextInput,
  Button,
  Group,
  Card,
  ActionIcon,
  Text,
  Alert,
  Loader,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  addCampaignEmails,
  getEmailLists,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  AddCampaignEmailsRequest,
} from "../../../../../api/requests_responses/outreach/email";

interface ManualEmail {
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
}

interface AddCampaignEmailsProps {
  campaignId: number;
  opened: boolean;
  onClose: () => void;
}

const AddCampaignEmails: React.FC<AddCampaignEmailsProps> = ({
  campaignId,
  opened,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<"list" | "manual">("list");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [manualEmails, setManualEmails] = useState<ManualEmail[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch email lists
  const { data: listsResponse, isLoading: loadingLists } = useQuery(
    EmailOutreachQueryNames.GET_EMAIL_LISTS,
    getEmailLists,
    {
      enabled: opened,
      refetchOnWindowFocus: false,
    },
  );

  // Add emails mutation
  const addMutation = useMutation(
    (data: AddCampaignEmailsRequest) => addCampaignEmails(campaignId, data),
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
          `Added ${response.data.added} email(s). ${
            response.data.duplicates > 0
              ? `${response.data.duplicates} duplicate(s) skipped.`
              : ""
          }`,
        );
        setErrorMessage("");

        // Reset form
        setSource("list");
        setSelectedListId(null);
        setManualEmails([]);
        setEmailInput("");
        setNameInput("");
        setCompanyInput("");
        setLocationInput("");
        setPhoneInput("");

        // Close after delay
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 2000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to add emails",
        );
        setSuccessMessage("");
      },
    },
  );

  const handleAddManualEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      setErrorMessage("Email address is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Invalid email address format");
      return;
    }

    // Check for duplicates
    if (manualEmails.some((e) => e.email === trimmedEmail)) {
      setErrorMessage("This email has already been added");
      return;
    }

    const newEmail: ManualEmail = {
      email: trimmedEmail,
      name: nameInput.trim() || undefined,
      company_name: companyInput.trim() || undefined,
      location: locationInput.trim() || undefined,
      phone_number: phoneInput.trim() || undefined,
    };

    setManualEmails([...manualEmails, newEmail]);
    setErrorMessage("");

    // Clear inputs
    setEmailInput("");
    setNameInput("");
    setCompanyInput("");
    setLocationInput("");
    setPhoneInput("");
  };

  const handleRemoveManualEmail = (index: number) => {
    setManualEmails(manualEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (source === "list") {
      if (!selectedListId) {
        setErrorMessage("Please select an email list");
        return;
      }

      addMutation.mutate({
        source: "list",
        email_list_id: parseInt(selectedListId),
      });
    } else {
      if (manualEmails.length === 0) {
        setErrorMessage("Please add at least one email");
        return;
      }

      addMutation.mutate({
        source: "manual",
        emails: manualEmails,
      });
    }
  };

  const lists = listsResponse?.data?.email_lists || [];
  const listOptions = lists.map((list) => ({
    value: String(list.id),
    label: `${list.name} (${list.total_contacts} contacts)`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Emails to Campaign"
      size="lg"
    >
      <Stack gap="md">
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

        <div>
          <Text size="sm" fw={500} mb="xs">
            Source
          </Text>
          <SegmentedControl
            value={source}
            onChange={(value) => setSource(value as "list" | "manual")}
            data={[
              { value: "list", label: "From List" },
              { value: "manual", label: "Manual Input" },
            ]}
            fullWidth
          />
        </div>

        {source === "list" ? (
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
                <Select
                  label="Email List"
                  placeholder="Select a list to import"
                  data={listOptions}
                  value={selectedListId}
                  onChange={setSelectedListId}
                  searchable
                  disabled={listOptions.length === 0}
                />
                {listOptions.length === 0 && (
                  <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                    No email lists available. Please create a list first.
                  </Alert>
                )}
                {selectedListId && (
                  <Alert color="blue" variant="light">
                    <Text size="sm">
                      This will add all contacts from the selected list to this
                      campaign. Duplicates will be automatically skipped.
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
                Add emails manually. All fields except email are optional.
                Duplicates will be automatically skipped.
              </Text>
            </Alert>

            <Card withBorder padding="md">
              <Stack gap="sm">
                <TextInput
                  label="Email Address"
                  placeholder="contact@example.com"
                  required
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
                    label="Name"
                    placeholder="John Doe"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                  />
                  <TextInput
                    label="Company"
                    placeholder="Acme Inc"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                  />
                </Group>
                <Group grow>
                  <TextInput
                    label="Location"
                    placeholder="New York, USA"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                  />
                  <TextInput
                    label="Phone"
                    placeholder="+1234567890"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                </Group>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleAddManualEmail}
                  disabled={!emailInput.trim()}
                  variant="light"
                >
                  Add to List
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
                          {(email.name ||
                            email.company_name ||
                            email.location) && (
                            <Text size="xs" c="dimmed">
                              {[email.name, email.company_name, email.location]
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

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={addMutation.isLoading}
            disabled={
              (source === "list" && !selectedListId) ||
              (source === "manual" && manualEmails.length === 0)
            }
          >
            Add Emails
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default AddCampaignEmails;

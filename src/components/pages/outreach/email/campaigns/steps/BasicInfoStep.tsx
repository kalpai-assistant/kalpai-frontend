import React, { useState } from "react";
import {
  Stack,
  TextInput,
  Text,
  Divider,
  MultiSelect,
  SegmentedControl,
  Button,
  Group,
  Card,
  ActionIcon,
  Alert,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash, IconAlertCircle } from "@tabler/icons-react";
import CampaignSenderAccounts from "../CampaignSenderAccounts";
import { CampaignGmailAccount } from "../../../../../../api/requests_responses/outreach/email";

type RecipientMode = "multi-list" | "manual";

interface ManualEmail {
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
}

interface BasicInfoStepProps {
  form: UseFormReturnType<any>;
  listOptions: Array<{ value: string; label: string }>;
  onSenderAccountsChange: (accounts: CampaignGmailAccount[]) => void;
  onRecipientModeChange?: (mode: RecipientMode) => void;
  onMultipleListsChange?: (listIds: number[]) => void;
  onManualEmailsChange?: (emails: ManualEmail[]) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  form,
  listOptions,
  onSenderAccountsChange,
  onRecipientModeChange,
  onMultipleListsChange,
  onManualEmailsChange,
}) => {
  const [recipientMode, setRecipientMode] =
    useState<RecipientMode>("multi-list");
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState<ManualEmail[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");

  const handleRecipientModeChange = (value: RecipientMode) => {
    setRecipientMode(value);
    if (onRecipientModeChange) {
      onRecipientModeChange(value);
    }

    // Reset the opposite mode's data
    if (value === "multi-list") {
      setManualEmails([]);
      if (onManualEmailsChange) onManualEmailsChange([]);
    } else if (value === "manual") {
      setSelectedListIds([]);
      if (onMultipleListsChange) onMultipleListsChange([]);
    }
  };

  const handleMultiSelectChange = (values: string[]) => {
    setSelectedListIds(values);
    if (onMultipleListsChange) {
      onMultipleListsChange(values.map((v) => parseInt(v)));
    }
  };

  const handleAddManualEmail = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return; // Invalid email
    }

    // Check for duplicates
    if (manualEmails.some((e) => e.email === trimmedEmail)) {
      return; // Already added
    }

    const newEmail: ManualEmail = {
      email: trimmedEmail,
      name: nameInput.trim() || undefined,
      company_name: companyInput.trim() || undefined,
    };

    const updated = [...manualEmails, newEmail];
    setManualEmails(updated);
    if (onManualEmailsChange) {
      onManualEmailsChange(updated);
    }

    // Clear inputs
    setEmailInput("");
    setNameInput("");
    setCompanyInput("");
  };

  const handleRemoveManualEmail = (index: number) => {
    const updated = manualEmails.filter((_, i) => i !== index);
    setManualEmails(updated);
    if (onManualEmailsChange) {
      onManualEmailsChange(updated);
    }
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

  const totalRecipients = getTotalRecipients();

  return (
    <Stack gap="md" mt="md">
      <TextInput
        label="Campaign Name"
        placeholder="e.g., Q1 Product Launch"
        required
        {...form.getInputProps("name")}
      />

      <Divider label="Recipients" labelPosition="center" my="md" />

      <div>
        <Text size="sm" fw={500} mb="xs">
          Recipient Source
        </Text>
        <SegmentedControl
          value={recipientMode}
          onChange={(value) =>
            handleRecipientModeChange(value as RecipientMode)
          }
          data={[
            { value: "multi-list", label: "Multiple Lists" },
            { value: "manual", label: "Manual Input" },
          ]}
          fullWidth
        />
      </div>

      {recipientMode === "multi-list" && (
        <>
          <MultiSelect
            label="Email Lists"
            placeholder="Select multiple email lists"
            data={listOptions}
            disabled={listOptions.length === 0}
            value={selectedListIds}
            onChange={handleMultiSelectChange}
            searchable
            clearable
            description="Emails will be automatically deduplicated"
          />
          {listOptions.length === 0 && (
            <Text size="sm" c="dimmed">
              No email lists available. Please create a list first.
            </Text>
          )}
          {selectedListIds.length === 0 && (
            <Alert color="blue" icon={<IconAlertCircle size={16} />}>
              Please select at least one email list
            </Alert>
          )}
        </>
      )}

      {recipientMode === "manual" && (
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              Add emails manually. You can add as many as needed, and they'll be
              automatically deduplicated.
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
              >
                Add Email
              </Button>
            </Stack>
          </Card>

          {manualEmails.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Added Emails ({manualEmails.length})
              </Text>
              {manualEmails.map((email, index) => (
                <Card key={index} withBorder padding="sm">
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
            </Stack>
          )}

          {manualEmails.length === 0 && (
            <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
              No emails added yet. Please add at least one email address.
            </Alert>
          )}
        </Stack>
      )}

      {totalRecipients > 0 && (
        <Alert color="green" variant="light">
          <Text size="sm" fw={500}>
            Total Recipients: {totalRecipients.toLocaleString()}
          </Text>
          <Text size="xs" c="dimmed">
            {recipientMode === "multi-list" &&
              "(Duplicates will be automatically removed)"}
          </Text>
        </Alert>
      )}

      <Divider my="md" />

      <CampaignSenderAccounts
        isCreationMode={true}
        onAccountsChange={onSenderAccountsChange}
      />
    </Stack>
  );
};

export default BasicInfoStep;

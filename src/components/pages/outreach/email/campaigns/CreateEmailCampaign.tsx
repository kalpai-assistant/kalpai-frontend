import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Group,
  Alert,
  Stepper,
  Loader,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { IconX, IconCheck } from "@tabler/icons-react";
import {
  createCampaign,
  getEmailLists,
  updateSendingSchedule,
  addCampaignGmailAccount,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  SendingSchedule,
  CampaignGmailAccount,
} from "../../../../../api/requests_responses/outreach/email";
import BasicInfoStep from "./steps/BasicInfoStep";
import EmailContentStep, {
  ImageMapping,
  EmailMode,
} from "./steps/EmailContentStep";
import ScheduleStep, { WeekSchedule, DaySchedule } from "./steps/ScheduleStep";

type RecipientMode = "multi-list" | "manual";

interface ManualEmail {
  email: string;
  name?: string;
  company_name?: string;
  location?: string;
  phone_number?: string;
}

const CreateEmailCampaign: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [emailMode, setEmailMode] = useState<EmailMode>("template");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [imageMappings, setImageMappings] = useState<ImageMapping[]>([]);
  const [senderAccounts, setSenderAccounts] = useState<CampaignGmailAccount[]>(
    [],
  );
  const [recipientMode, setRecipientMode] =
    useState<RecipientMode>("multi-list");
  const [multipleListIds, setMultipleListIds] = useState<number[]>([]);
  const [manualEmails, setManualEmails] = useState<ManualEmail[]>([]);

  // Sending schedule state
  const [timezone, setTimezone] = useState<string>("Asia/Kolkata");
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
  });

  const { data: listsResponse, isLoading: isLoadingLists } = useQuery(
    EmailOutreachQueryNames.GET_EMAIL_LISTS,
    getEmailLists,
    { refetchOnWindowFocus: false },
  );

  const form = useForm({
    initialValues: {
      name: "",
      subject_line: "",
      email_template: "",
      ai_flavor: "",
      scheduled_at: null as Date | null,
    },
    validate: {
      name: (value: string) => (!value ? "Campaign name is required" : null),
      subject_line: (value: string) => (!value ? "Subject line is required" : null),
      ai_flavor: (value: string, values: any) => {
        // Only validate AI flavor in automation mode
        // Validation happens in handleNext for better UX
        return null;
      },
    },
  });

  const createMutation = useMutation(createCampaign, {
    onSuccess: async (response) => {
      const campaignId = response.data.id;

      // Add sender accounts
      try {
        for (const account of senderAccounts) {
          await addCampaignGmailAccount(campaignId, {
            gmail_account_id: account.gmail_account_id,
            daily_limit: account.daily_limit,
            priority: account.priority,
          });
        }
      } catch (error) {
        console.error("Failed to add sender accounts:", error);
        // Accounts can be added later from campaign details
      }

      // Always send the sending schedule (even if disabled)
      try {
        // Convert weekSchedule to API format (windows array)
        const windows = Object.entries(weekSchedule)
          .filter(([_, daySchedule]) => (daySchedule as DaySchedule).enabled)
          .map(([day, daySchedule]) => ({
            days: [day],
            start_time: (daySchedule as DaySchedule).startTime,
            end_time: (daySchedule as DaySchedule).endTime,
          }));

        const scheduleData: Partial<SendingSchedule> = {
          timezone,
          windows,
          enabled: scheduleEnabled,
        };

        await updateSendingSchedule(campaignId, scheduleData);
      } catch (error) {
        console.error("Failed to save sending schedule:", error);
        // Schedule creation failed, but campaign was created successfully
        // User can configure it later from the campaign details page
      }

      queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
      navigate(`/outreach/email/campaigns/${campaignId}`);
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.detail || "Failed to create campaign",
      );
    },
  });

  const handleNext = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default form behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (activeStep === 0) {
      form.validateField("name");

      // Validate based on recipient mode
      if (recipientMode === "multi-list") {
        if (multipleListIds.length === 0) {
          setErrorMessage("Please select at least one email list");
          return;
        }
      } else if (recipientMode === "manual") {
        if (manualEmails.length === 0) {
          setErrorMessage("Please add at least one email address");
          return;
        }
      }

      // Validate sender accounts
      if (senderAccounts.length === 0) {
        setErrorMessage("Please add at least one sender Gmail account");
        return;
      }

      if (form.isValid("name")) {
        setActiveStep(1);
        setErrorMessage("");
      }
    } else if (activeStep === 1) {
      form.validateField("subject_line");

      // Validate based on mode
      if (emailMode === "template") {
        // Template mode: template should have content
        if (!form.values.email_template?.trim()) {
          setErrorMessage(
            "Please enter a template, generate one from a prompt, or write manually",
          );
          return;
        }
      } else {
        // Automation mode: AI flavor is required
        form.validateField("ai_flavor");
        if (!form.values.ai_flavor) {
          setErrorMessage("Please select a tone for automation mode");
          return;
        }
      }

      if (form.isValid("subject_line")) {
        setActiveStep(2);
        setErrorMessage("");
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // Prevent Enter key from submitting the form unless on the last step
    if (e.key === "Enter" && activeStep < 2) {
      e.preventDefault();
    }
  };

  const handleFormSubmit = (values: typeof form.values) => {
    // Only allow form submission on the final step
    if (activeStep !== 2) {
      return;
    }

    handleSubmit(values);
  };

  const handleSubmit = (values: typeof form.values) => {
    // CRITICAL CHECK: Only submit on step 2
    if (activeStep !== 2) {
      setErrorMessage("");
      return;
    }

    setErrorMessage("");

    // Validate sender account
    if (senderAccounts.length === 0) {
      setErrorMessage("No sender account selected");
      return;
    }

    // Check if template has image placeholders
    const hasImagePlaceholders = /\{\{IMAGE_\d+\}\}/g.test(
      values.email_template || "",
    );

    // Validate: if there are image placeholders, ensure files are provided
    if (hasImagePlaceholders) {
      const placeholderMatches =
        (values.email_template || "").match(/\{\{IMAGE_\d+\}\}/g) || [];
      const missingFiles = placeholderMatches.filter((placeholder) => {
        const key = placeholder.replace(/[{}]/g, "");
        return !imageMappings.find(
          (m) => m.placeholder === key && (m.file || m.fileId),
        );
      });

      if (missingFiles.length > 0) {
        setErrorMessage(
          `Please provide images for: ${missingFiles.join(
            ", ",
          )}. Drop images into the template or use the "Select Image" button below.`,
        );
        return;
      }
    }

    // Always use FormData for consistency
    const formData = new FormData();

    formData.append("name", values.name);
    formData.append("subject_line", values.subject_line);

    // Handle recipient data based on mode
    if (recipientMode === "multi-list" && multipleListIds.length > 0) {
      formData.append("email_list_ids", JSON.stringify(multipleListIds));
    } else if (recipientMode === "manual" && manualEmails.length > 0) {
      formData.append("emails", JSON.stringify(manualEmails));
    }

    // Backend requires gmail_account_id for backward compatibility
    // Use the first sender account from multi-sender list
    if (senderAccounts.length > 0) {
      formData.append(
        "gmail_account_id",
        String(senderAccounts[0].gmail_account_id),
      );
    } else {
      // This should never happen due to validation in handleNext
      setErrorMessage("No sender account selected");
      return;
    }

    if (emailMode === "template") {
      if (values.email_template) {
        formData.append("email_template", values.email_template);
      }

      // Add images if any
      const fileMappings: Record<string, number | string> = {};
      let fileIndex = 0;

      imageMappings.forEach((mapping) => {
        if (mapping.file) {
          // New file upload
          formData.append("files", mapping.file);
          fileMappings[mapping.placeholder] = fileIndex;
          fileIndex++;
        } else if (mapping.fileId) {
          // Existing file, keep it
          fileMappings[mapping.placeholder] = String(mapping.fileId);
        }
      });

      if (Object.keys(fileMappings).length > 0) {
        formData.append("file_mappings", JSON.stringify(fileMappings));
      }
    } else {
      // Automation mode
      if (values.ai_flavor) {
        formData.append("ai_flavor", values.ai_flavor);
      }
    }

    if (scheduleEnabled && values.scheduled_at) {
      formData.append("scheduled_at", values.scheduled_at.toISOString());
    }

    createMutation.mutate(formData);
  };

  const lists = listsResponse?.data?.email_lists || [];

  const listOptions =
    lists.length > 0
      ? lists.map((list) => ({
          value: String(list.id),
          label: `${list.name} (${list.total_contacts} contacts)`,
        }))
      : [];

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Create Email Campaign</Title>
          <Button
            variant="subtle"
            onClick={() => navigate("/outreach/email/campaigns")}
          >
            Cancel
          </Button>
        </Group>

        {!isLoadingLists && (
          <form
            onSubmit={form.onSubmit(handleFormSubmit)}
            onKeyDown={handleFormKeyDown}
          >
            <Stepper active={activeStep}>
              <Stepper.Step
                label="Basic Info"
                description="Select account and list"
              >
                <BasicInfoStep
                  form={form}
                  listOptions={listOptions}
                  onSenderAccountsChange={setSenderAccounts}
                  onRecipientModeChange={setRecipientMode}
                  onMultipleListsChange={setMultipleListIds}
                  onManualEmailsChange={setManualEmails}
                />
              </Stepper.Step>
              <Stepper.Step
                label="Email Content"
                description="Subject and template"
              >
                <EmailContentStep
                  form={form}
                  emailMode={emailMode}
                  onEmailModeChange={setEmailMode}
                  imageMappings={imageMappings}
                  onImageMappingsChange={setImageMappings}
                  availableVariables={availableVariables}
                  onAvailableVariablesChange={setAvailableVariables}
                  onErrorMessage={setErrorMessage}
                  onSuccessMessage={(msg) => {
                    setSuccessMessage(msg);
                    setTimeout(() => setSuccessMessage(""), 3000);
                  }}
                />
              </Stepper.Step>
              <Stepper.Step label="Schedule" description="When to send">
                <ScheduleStep
                  scheduleEnabled={scheduleEnabled}
                  setScheduleEnabled={setScheduleEnabled}
                  timezone={timezone}
                  setTimezone={setTimezone}
                  weekSchedule={weekSchedule}
                  setWeekSchedule={setWeekSchedule}
                />
              </Stepper.Step>
            </Stepper>

            <Group justify="space-between" mt="xl">
              <Button
                variant="default"
                onClick={handleBack}
                disabled={activeStep === 0}
                type="button"
              >
                Back
              </Button>
              {activeStep < 2 ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleNext(e);
                  }}
                  type="button"
                >
                  Next step
                </Button>
              ) : (
                <Button type="submit" loading={createMutation.isLoading}>
                  Create Campaign
                </Button>
              )}
            </Group>
          </form>
        )}

        {errorMessage && (
          <Alert icon={<IconX size={16} />} title="Error" color="red">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green">
            {successMessage}
          </Alert>
        )}

        {isLoadingLists && (
          <Group justify="center" p="xl">
            <Loader />
            <Text>Loading accounts and lists...</Text>
          </Group>
        )}
      </Stack>
    </Paper>
  );
};

export default CreateEmailCampaign;

import React, { useState, useEffect } from "react";
import { Stack, Button, Group, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import {
  updateCampaignContent,
  getCampaignFiles,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  Campaign,
} from "../../../../../api/requests_responses/outreach/email";
import EmailContentStep, {
  ImageMapping,
  EmailMode,
} from "./steps/EmailContentStep";

// ============================================================================
// Types
// ============================================================================

interface UpdateCampaignContentProps {
  campaign: Campaign;
}

// ============================================================================
// Main Component
// ============================================================================

const UpdateCampaignContent: React.FC<UpdateCampaignContentProps> = ({
  campaign,
}) => {
  const queryClient = useQueryClient();
  const [emailMode, setEmailMode] = useState<EmailMode>(
    campaign.ai_flavor ? "automation" : "template",
  );
  const [availableVariables, setAvailableVariables] = useState<string[]>([]);
  const [imageMappings, setImageMappings] = useState<ImageMapping[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: filesResponse } = useQuery(
    [EmailOutreachQueryNames.GET_CAMPAIGN_FILES, campaign.id],
    () => getCampaignFiles(campaign.id),
    {
      enabled: !!campaign.id && emailMode === "template",
      refetchOnWindowFocus: false,
    },
  );

  // ============================================================================
  // Form Setup
  // ============================================================================

  const form = useForm({
    initialValues: {
      subject_line: campaign.subject_line || "",
      email_template: campaign.email_template || "",
      ai_flavor: campaign.ai_flavor || "",
    },
    validate: {
      subject_line: (value) => (!value ? "Subject line is required" : null),
    },
  });

  // Load existing images
  useEffect(() => {
    if (filesResponse?.data?.files) {
      const mappings: ImageMapping[] = filesResponse.data.files.map((file) => ({
        placeholder: file.placeholder_key,
        fileId: file.file_id,
        s3Url: file.s3_url,
        previewUrl: file.s3_url,
      }));
      setImageMappings(mappings);
    }
  }, [filesResponse]);

  // ============================================================================
  // Mutations
  // ============================================================================

  const updateMutation = useMutation(
    (data: FormData) => updateCampaignContent(campaign.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_CAMPAIGN,
          String(campaign.id),
        ]);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        setSuccessMessage("Campaign content updated successfully!");
        setErrorMessage("");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to update campaign content",
        );
        setSuccessMessage("");
      },
    },
  );

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleSubmit = (values: typeof form.values) => {
    setErrorMessage("");

    // Check if template has image placeholders
    const hasImagePlaceholders = /\{\{IMAGE_\d+\}\}/g.test(
      values.email_template || "",
    );

    // Validate: if there are image placeholders, ensure files are provided
    if (hasImagePlaceholders && emailMode === "template") {
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
          )}. Drop images into the template or use the "Select Image" button.`,
        );
        return;
      }
    }

    const formData = new FormData();

    formData.append("subject_line", values.subject_line);

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
      // Clear template when switching to automation
      formData.append("email_template", "");
    }

    updateMutation.mutate(formData);
  };

  // ============================================================================
  // Render
  // ============================================================================

  // Don't allow editing if campaign is running or completed
  const isEditable = ![
    // "running",
    "completed",
    // "paused", // Add paused if you don't want to allow editing
  ].includes(campaign.status);

  if (!isEditable) {
    return (
      <Alert color="blue" icon={<IconAlertCircle />}>
        Campaign content cannot be edited while the campaign is{" "}
        {campaign.status}. Please pause or stop the campaign first.
      </Alert>
    );
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
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

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={updateMutation.isLoading}
            disabled={!form.isDirty()}
          >
            Update Content
          </Button>
        </Group>

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
      </Stack>
    </form>
  );
};

export default UpdateCampaignContent;

import React, { useState } from "react";
import {
  Stack,
  TextInput,
  Select,
  Group,
  Text,
  SegmentedControl,
  Textarea,
  Button,
  Alert,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconSparkles, IconWand } from "@tabler/icons-react";
import { useMutation } from "react-query";
import {
  generateTemplate,
  improveTemplate,
} from "../../../../../../api/outreach/email";
import { AIFlavor } from "../../../../../../api/requests_responses/outreach/email";
import TemplateEditor from "../../../shared/TemplateEditor";
import TemplatePreview from "../../shared/TemplatePreview";
import ImageUploadManager from "../../shared/ImageUploadManager";

// ============================================================================
// Types
// ============================================================================

export interface ImageMapping {
  placeholder: string;
  file?: File;
  fileId?: number;
  s3Url?: string;
  previewUrl?: string;
}

export type EmailMode = "template" | "automation";

interface EmailContentStepProps {
  form: UseFormReturnType<any>;
  emailMode: EmailMode;
  onEmailModeChange: (mode: EmailMode) => void;
  imageMappings: ImageMapping[];
  onImageMappingsChange: (mappings: ImageMapping[]) => void;
  availableVariables: string[];
  onAvailableVariablesChange: (variables: string[]) => void;
  onErrorMessage?: (message: string) => void;
  onSuccessMessage?: (message: string) => void;
}

// ============================================================================
// Main Component
// ============================================================================

const EmailContentStep: React.FC<EmailContentStepProps> = ({
  form,
  emailMode,
  onEmailModeChange,
  imageMappings,
  onImageMappingsChange,
  availableVariables,
  onAvailableVariablesChange,
  onErrorMessage,
  onSuccessMessage,
}) => {
  // ============================================================================
  // State
  // ============================================================================

  const [templatePrompt, setTemplatePrompt] = useState<string>("");
  const [automationPrompt, setAutomationPrompt] = useState<string>("");
  const [templateTone, setTemplateTone] = useState<
    "professional" | "casual" | "friendly" | ""
  >("");
  const [improvementDirection, setImprovementDirection] = useState<string>("");

  // ============================================================================
  // Mutations
  // ============================================================================

  const generateTemplateMutation = useMutation(generateTemplate, {
    onSuccess: (response) => {
      form.setFieldValue("email_template", response.data.template);
      // Update subject line if provided by API
      if (response.data.subject_line) {
        form.setFieldValue("subject_line", response.data.subject_line);
      }
      // Update available variables
      onAvailableVariablesChange(response.data.available_variables || []);
      if (onSuccessMessage) {
        onSuccessMessage(
          "Template generated successfully! You can edit it if needed.",
        );
      }
    },
    onError: (error: any) => {
      if (onErrorMessage) {
        onErrorMessage(
          error?.response?.data?.detail || "Failed to generate template",
        );
      }
    },
  });

  const improveTemplateMutation = useMutation(improveTemplate, {
    onSuccess: (response) => {
      form.setFieldValue("email_template", response.data.template);
      // Update subject line if provided by API
      if (response.data.subject_line) {
        form.setFieldValue("subject_line", response.data.subject_line);
      }
      if (onSuccessMessage) {
        onSuccessMessage("Template improved! Review and edit if needed.");
      }
    },
    onError: (error: any) => {
      if (onErrorMessage) {
        onErrorMessage(
          error?.response?.data?.detail || "Failed to improve template",
        );
      }
    },
  });

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleImageDrop = (file: File, placeholder: string) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    // Add or update the image mapping
    onImageMappingsChange(
      imageMappings.find((m) => m.placeholder === placeholder)
        ? imageMappings.map((m) =>
            m.placeholder === placeholder
              ? { placeholder, file, previewUrl }
              : m,
          )
        : [...imageMappings, { placeholder, file, previewUrl }],
    );

    // Cleanup old preview URL if it exists
    const existing = imageMappings.find((m) => m.placeholder === placeholder);
    if (existing?.previewUrl && existing.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(existing.previewUrl);
    }
  };

  const handleGenerateTemplate = () => {
    if (!templatePrompt.trim()) {
      if (onErrorMessage) {
        onErrorMessage("Please enter a prompt to generate the template");
      }
      return;
    }
    if (onErrorMessage) onErrorMessage("");
    const requestData: any = {
      prompt: templatePrompt,
      subject_line: form.values.subject_line || undefined,
    };
    if (templateTone) {
      requestData.tone = templateTone;
    }
    generateTemplateMutation.mutate(requestData);
  };

  const handleImproveTemplate = () => {
    if (!form.values.email_template?.trim()) {
      if (onErrorMessage) {
        onErrorMessage("Please enter or generate a template first");
      }
      return;
    }
    if (onErrorMessage) onErrorMessage("");
    const requestData: any = {
      template: form.values.email_template,
      subject_line: form.values.subject_line || undefined,
    };
    if (improvementDirection.trim()) {
      requestData.improvement_direction = improvementDirection;
    }
    improveTemplateMutation.mutate(requestData);
  };

  const handleEmailModeChange = (value: EmailMode) => {
    onEmailModeChange(value);
    if (onErrorMessage) onErrorMessage("");
    // Reset template when switching to automation mode
    if (value === "automation") {
      form.setFieldValue("email_template", "");
      onAvailableVariablesChange([]);
    }
    // Reset AI flavor when switching to template mode
    if (value === "template") {
      form.setFieldValue("ai_flavor", "");
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Stack gap="md" mt="md">
      <Group justify="space-between" align="center">
        <div style={{ flex: 1 }}>
          <TextInput
            label="Subject Line"
            placeholder="e.g., Introducing Our New Product"
            required
            {...form.getInputProps("subject_line")}
          />
        </div>
        {emailMode === "template" && form.values.email_template && (
          <div style={{ marginTop: "24px" }}>
            <TemplatePreview
              subject={form.values.subject_line}
              template={form.values.email_template}
              imageMappings={imageMappings}
            />
          </div>
        )}
      </Group>

      <div>
        <Text size="sm" fw={500} mb="xs">
          Email Content Mode
        </Text>
        <SegmentedControl
          value={emailMode}
          onChange={(value) => handleEmailModeChange(value as EmailMode)}
          data={[
            {
              value: "template",
              label: "Template Based",
            },
            {
              value: "automation",
              label: "Full Automation",
            },
          ]}
          fullWidth
        />
      </div>

      {emailMode === "template" ? (
        <Stack gap="md">
          <div>
            <Textarea
              label="Prompt (Optional)"
              placeholder="e.g., Write a professional email introducing our new product line to potential customers..."
              value={templatePrompt}
              onChange={(e) => setTemplatePrompt(e.target.value)}
              minRows={3}
              description="Describe what you want the email to say. Leave empty to write manually."
            />
            <Select
              label="Tone (Optional)"
              placeholder="Select tone for generation"
              data={[
                { value: "professional", label: "Professional" },
                { value: "casual", label: "Casual" },
                { value: "friendly", label: "Friendly" },
              ]}
              value={templateTone}
              onChange={(value) =>
                setTemplateTone(
                  (value as "professional" | "casual" | "friendly") || "",
                )
              }
              clearable
              mt="xs"
            />
            <Group mt="xs">
              <Button
                leftSection={<IconSparkles size={16} />}
                onClick={handleGenerateTemplate}
                loading={generateTemplateMutation.isLoading}
                disabled={!templatePrompt.trim()}
                variant="light"
              >
                Generate Template
              </Button>
            </Group>
          </div>

          {availableVariables.length > 0 && (
            <Alert color="blue" variant="light">
              <Text size="sm" fw={500} mb="xs">
                Available Variables:
              </Text>
              <Group gap="xs">
                {availableVariables.map((variable) => (
                  <Text
                    key={variable}
                    size="xs"
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "#f0f0f0",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {variable}
                  </Text>
                ))}
              </Group>
            </Alert>
          )}

          <TemplateEditor
            label="Email Template"
            value={form.values.email_template}
            onChange={(value) => {
              form.setFieldValue("email_template", value);
            }}
            placeholder="Hi {{name}}, we're excited to introduce... (You can write directly or generate from prompt above)"
            variables={
              availableVariables.length > 0
                ? availableVariables.map((v) => v.replace(/[{}]/g, ""))
                : ["name", "company_name", "location", "phone_number", "email"]
            }
            onImageDrop={handleImageDrop}
          />

          {form.values.email_template && (
            <Stack gap="xs">
              <Textarea
                label="Improvement Direction (Optional)"
                placeholder="e.g., Make it more concise, add a call-to-action, make it warmer..."
                value={improvementDirection}
                onChange={(e) => setImprovementDirection(e.target.value)}
                minRows={2}
                description="Tell us how you'd like to improve the template"
              />
              <Button
                leftSection={<IconWand size={16} />}
                onClick={handleImproveTemplate}
                loading={improveTemplateMutation.isLoading}
                variant="light"
                color="blue"
              >
                Make it Better
              </Button>
            </Stack>
          )}

          {/* Image Upload Manager */}
          <ImageUploadManager
            template={form.values.email_template}
            imageMappings={imageMappings}
            onChange={onImageMappingsChange}
          />
        </Stack>
      ) : (
        <Stack gap="md">
          <Select
            label="Tone"
            placeholder="Select tone"
            required
            data={[
              {
                value: AIFlavor.PROFESSIONAL,
                label: "Professional",
              },
              { value: AIFlavor.CASUAL, label: "Casual" },
              { value: AIFlavor.FRIENDLY, label: "Friendly" },
            ]}
            {...form.getInputProps("ai_flavor")}
          />

          <Textarea
            label="Additional Information (Optional)"
            placeholder="e.g., Focus on our new product features, mention our 30-day money-back guarantee..."
            value={automationPrompt}
            onChange={(e) => setAutomationPrompt(e.target.value)}
            minRows={3}
            description="Provide any additional context or requirements for the automated email generation."
          />
        </Stack>
      )}
    </Stack>
  );
};

export default EmailContentStep;

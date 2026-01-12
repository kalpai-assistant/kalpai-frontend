import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  TextInput,
  Textarea,
  FileButton,
  Group,
  Alert,
  Text,
  Stepper,
  Card,
  Badge,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconUpload,
  IconCheck,
  IconX,
  IconFileSpreadsheet,
  IconArrowRight,
  IconArrowLeft,
  IconFileCheck,
} from "@tabler/icons-react";
import { createEmailList } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";
import { useColumnMapping } from "../../../../../hooks/useColumnMapping";
import ColumnMapper from "./ColumnMapper";
import { validateFileType } from "../../../../../utils/fileParser";

/**
 * Enhanced CreateEmailList Component
 * Features:
 * - Multi-step form with file upload and column mapping
 * - Auto-detection of column mappings
 * - Visual preview of data
 * - Validation and error handling
 */

const CreateEmailList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [activeStep, setActiveStep] = useState(0);

  // Use custom hook for column mapping
  const {
    state: mappingState,
    parseAndSetFile,
    updateMapping,
    resetMapping,
    error: parsingError,
    isLoading: isParsing,
  } = useColumnMapping();

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value: string) => (!value ? "List name is required" : null),
    },
  });

  const createMutation = useMutation(
    (formData: FormData) => createEmailList(formData),
    {
      onSuccess: (response) => {
        setSuccessMessage("Email list created successfully!");
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_EMAIL_LISTS);
        setTimeout(() => {
          navigate(`/outreach/email/lists/${response.data.id}`);
        }, 1500);
      },
      onError: (error: any) => {
        setErrorMessage(
          error?.response?.data?.detail || "Failed to create email list",
        );
        // If error is about missing columns, go back to mapping step
        if (
          error?.response?.data?.detail?.includes("Missing") ||
          error?.response?.data?.detail?.includes("column")
        ) {
          setActiveStep(1);
        }
      },
    },
  );

  const handleFileChange = async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setErrorMessage("");
    setFile(selectedFile);

    // Validate file type
    if (!validateFileType(selectedFile)) {
      setErrorMessage(
        "Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
      );
      setFile(null);
      return;
    }

    // Parse file and extract columns
    try {
      await parseAndSetFile(selectedFile);
    } catch (err) {
      // Error handling is managed by the hook
      console.error("File parsing error:", err);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    resetMapping();
    setErrorMessage("");
    if (activeStep > 0) {
      setActiveStep(0);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate step 1 (basic info and file)
      const validationErrors = form.validate();
      if (validationErrors.hasErrors) {
        return;
      }

      if (!file) {
        setErrorMessage("Please upload a file with contacts");
        return;
      }

      if (!mappingState.filePreview) {
        setErrorMessage("Please wait for file to be processed");
        return;
      }

      setErrorMessage("");
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    setErrorMessage("");
    setActiveStep(0);
  };

  const handleSubmit = () => {
    if (!file || !mappingState.filePreview) {
      setErrorMessage("Please upload a file with contacts");
      return;
    }

    if (!mappingState.isValid) {
      setErrorMessage("Please map all required fields before submitting");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("name", form.values.name);
    if (form.values.description) {
      formData.append("description", form.values.description);
    }
    formData.append("file", file);

    // Add column mapping if any fields are mapped
    const hasMapping = Object.values(mappingState.columnMapping).some(
      (val) => val !== null && val !== "",
    );

    if (hasMapping) {
      // Create reverse mapping (system field -> file column)
      const reverseMapping: { [key: string]: string } = {};
      Object.entries(mappingState.columnMapping).forEach(([key, value]) => {
        if (value) {
          reverseMapping[key] = value;
        }
      });
      formData.append("column_mapping", JSON.stringify(reverseMapping));
    }

    createMutation.mutate(formData);
  };

  const canProceedToMapping =
    file && mappingState.filePreview && !isParsing && !parsingError;

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3}>Create Email List</Title>
          <Button
            variant="subtle"
            onClick={() => navigate("/outreach/email/lists")}
          >
            Cancel
          </Button>
        </Group>

        {successMessage && (
          <Alert icon={<IconCheck size={16} />} title="Success" color="green">
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert icon={<IconX size={16} />} title="Error" color="red">
            {errorMessage}
          </Alert>
        )}

        {parsingError && (
          <Alert
            icon={<IconX size={16} />}
            title="File Parsing Error"
            color="red"
          >
            {parsingError}
          </Alert>
        )}

        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
        >
          {/* Step 1: Basic Info & File Upload */}
          <Stepper.Step
            label="Upload File"
            description="Provide list details and file"
            icon={<IconUpload size={18} />}
          >
            <Stack gap="md" mt="md">
              <TextInput
                label="List Name"
                placeholder="e.g., Q1 Prospects"
                required
                {...form.getInputProps("name")}
              />

              <Textarea
                label="Description"
                placeholder="Optional description for this list"
                minRows={3}
                {...form.getInputProps("description")}
              />

              <Card withBorder padding="md">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Upload Contacts File
                    </Text>
                    <Badge color="blue" variant="light">
                      CSV / Excel
                    </Badge>
                  </Group>

                  <Text size="xs" c="dimmed">
                    Upload a CSV or Excel file containing your contact list.
                    We'll help you map the columns in the next step.
                  </Text>

                  {!file ? (
                    <FileButton
                      onChange={handleFileChange}
                      accept=".csv,.xlsx,.xls"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          leftSection={<IconUpload size={16} />}
                          variant="light"
                          fullWidth
                          loading={isParsing}
                        >
                          Choose File
                        </Button>
                      )}
                    </FileButton>
                  ) : (
                    <Card withBorder padding="sm" bg="gray.0">
                      <Group justify="space-between">
                        <Group gap="xs">
                          <IconFileCheck size={20} color="green" />
                          <Box>
                            <Text size="sm" fw={500}>
                              {file.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {(file.size / 1024).toFixed(2)} KB
                              {mappingState.filePreview &&
                                ` • ${mappingState.filePreview.totalRows} rows`}
                            </Text>
                          </Box>
                        </Group>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={handleRemoveFile}
                        >
                          Remove
                        </Button>
                      </Group>
                    </Card>
                  )}

                  {isParsing && (
                    <Alert color="blue" variant="light">
                      <Text size="sm">Analyzing file columns...</Text>
                    </Alert>
                  )}

                  {mappingState.filePreview && (
                    <Alert
                      icon={<IconCheck size={16} />}
                      color="green"
                      variant="light"
                    >
                      <Text size="sm">
                        File processed successfully! Found{" "}
                        {mappingState.filePreview.columns.length} columns.
                      </Text>
                    </Alert>
                  )}
                </Stack>
              </Card>

              <Group justify="flex-end" mt="md">
                <Button
                  onClick={handleNext}
                  rightSection={<IconArrowRight size={16} />}
                  disabled={!canProceedToMapping}
                >
                  Next: Map Columns
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* Step 2: Column Mapping */}
          <Stepper.Step
            label="Map Columns"
            description="Match file columns to fields"
            icon={<IconFileSpreadsheet size={18} />}
          >
            <Stack gap="md" mt="md">
              {mappingState.filePreview ? (
                <ColumnMapper
                  filePreview={mappingState.filePreview}
                  onMappingChange={updateMapping}
                  initialMapping={mappingState.columnMapping}
                />
              ) : (
                <Alert color="orange">
                  <Text size="sm">
                    No file data available. Please go back and upload a file.
                  </Text>
                </Alert>
              )}

              <Group justify="space-between" mt="md">
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  leftSection={<IconFileSpreadsheet size={16} />}
                  disabled={!mappingState.isValid}
                  loading={createMutation.isLoading}
                >
                  Create Email List
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>
        </Stepper>
      </Stack>
    </Paper>
  );
};

export default CreateEmailList;

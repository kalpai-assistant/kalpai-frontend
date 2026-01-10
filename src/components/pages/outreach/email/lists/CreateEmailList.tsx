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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconUpload,
  IconCheck,
  IconX,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { createEmailList } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

const CreateEmailList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

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
      },
    },
  );

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMessage("");

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (
      !validTypes.includes(selectedFile.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      setErrorMessage(
        "Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
      );
      setFile(null);
      return;
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    if (!file) {
      setErrorMessage("Please upload a file with contacts");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) {
      formData.append("description", values.description);
    }
    formData.append("file", file);

    createMutation.mutate(formData);
  };

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

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
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

            <div>
              <Text size="sm" fw={500} mb="xs">
                Upload Contacts File (CSV/Excel)
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                File should contain columns: email, name, company_name,
                location, phone_number
              </Text>
              <FileButton
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                // leftSection={<IconUpload size={16} />}
              >
                {(props) => (
                  <Button {...props} leftSection={<IconUpload size={16} />}>
                    {file ? file.name : "Choose File"}
                  </Button>
                )}
              </FileButton>
              {file && (
                <Text size="sm" c="dimmed" mt="xs">
                  File selected: {file.name} ({(file.size / 1024).toFixed(2)}{" "}
                  KB)
                </Text>
              )}
            </div>

            <Group justify="flex-end" mt="md">
              <Button
                type="submit"
                loading={createMutation.isLoading}
                leftSection={<IconFileSpreadsheet size={16} />}
              >
                Create List
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
};

export default CreateEmailList;

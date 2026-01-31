import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Group,
  Alert,
  Stepper,
  Text,
  Select,
  TextInput,
  FileInput,
  Table,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconAlertCircle,
  IconCheck,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import {
  getTemplates,
  getWhatsAppAccounts,
  createCampaign,
  addCampaignRecipients,
  startCampaign,
} from "../../../../../api/outreach/whatsapp";
import {
  WhatsAppQueryNames,
  type CampaignRecipient,
} from "../../../../../api/requests_responses/outreach/whatsapp";

interface CSVRow {
  phone_number: string;
  [key: string]: string;
}

const CreateWhatsAppCampaign: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [paramMapping, setParamMapping] = useState<Record<number, string>>({});

  const form = useForm({
    initialValues: {
      name: "",
      accountId: "",
      templateId: "",
      dailySendingLimit: 1000,
      scheduledAt: "", // datetime-local string
      teamAssignmentEnabled: false,
    },
    validate: {
      name: (value: string) => (!value ? "Campaign name is required" : null),
      accountId: (value: string) =>
        !value ? "Please select an account" : null,
      templateId: (value: string) =>
        !value ? "Please select a template" : null,
      dailySendingLimit: (value: number) =>
        value < 1 ? "Limit must be at least 1" : null,
    },
  });

  // Fetch accounts
  const { data: accountsData, isLoading: accountsLoading } = useQuery(
    WhatsAppQueryNames.GET_WHATSAPP_ACCOUNTS,
    async () => {
      const response = await getWhatsAppAccounts();
      return response.data;
    },
  );

  // Fetch templates for selected account
  const { data: templatesData, isLoading: templatesLoading } = useQuery(
    [WhatsAppQueryNames.GET_TEMPLATES, form.values.accountId],
    async () => {
      if (!form.values.accountId) return null;
      const response = await getTemplates(parseInt(form.values.accountId));
      return response.data;
    },
    {
      enabled: !!form.values.accountId,
    },
  );

  // Create campaign mutation
  const createMutation = useMutation(
    async () => {
      // Step 1: Create campaign
      const campaignResponse = await createCampaign({
        name: form.values.name,
        template_id: parseInt(form.values.templateId),
        daily_sending_limit: form.values.dailySendingLimit,
        scheduled_at: form.values.scheduledAt
          ? new Date(form.values.scheduledAt).toISOString()
          : null,
        team_assignment_enabled: form.values.teamAssignmentEnabled,
      });

      const campaignId = campaignResponse.data.id;

      // Step 2: Add recipients
      if (csvData.length > 0) {
        const recipients: CampaignRecipient[] = csvData.map((row) => {
          const template_params: Record<string, string> = {};
          Object.entries(paramMapping).forEach(([paramNum, csvColumn]) => {
            template_params[paramNum] = row[csvColumn] || "";
          });

          return {
            phone_number: row.phone_number,
            template_params,
          };
        });

        await addCampaignRecipients(campaignId, { recipients });
      }

      // Step 3: Start campaign
      // If scheduled, this might put it in SCHEDULED state. If not, RUNNING.
      await startCampaign(campaignId);

      return campaignId;
    },
    {
      onSuccess: (campaignId) => {
        queryClient.invalidateQueries(WhatsAppQueryNames.GET_CAMPAIGNS);
        navigate(`/outreach/whatsapp/campaigns/${campaignId}`);
      },
      onError: (error: any) => {
        console.error("Error creating campaign:", error);
      },
    },
  );

  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) return;

      const headers = lines[0].split(",").map((h) => h.trim());
      setCsvHeaders(headers);

      const data: CSVRow[] = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: CSVRow = { phone_number: "" };
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        return row;
      });

      setCsvData(data);
    };
    reader.readAsText(file);
  };

  const selectedTemplate = templatesData?.templates.find(
    (t) => t.id === parseInt(form.values.templateId),
  );

  // Extract template parameters (e.g., {{1}}, {{2}})
  const templateParams: number[] = [];
  if (selectedTemplate) {
    const matches = selectedTemplate.body.match(/\{\{(\d+)\}\}/g);
    if (matches) {
      matches.forEach((match: string) => {
        const num = parseInt(match.replace(/\{\{|\}\}/g, ""));
        if (!templateParams.includes(num)) {
          templateParams.push(num);
        }
      });
    }
  }

  const handleNext = () => {
    if (activeStep === 0) {
      const validation = form.validate();
      if (validation.hasErrors) return;
    }
    if (activeStep === 1 && csvData.length === 0) {
      return;
    }
    setActiveStep((current) => Math.min(current + 1, 3));
  };

  const handleBack = () => {
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    createMutation.mutate();
  };

  const accounts = accountsData?.accounts || [];
  const templates =
    templatesData?.templates.filter((t) => t.status === "APPROVED") || [];

  return (
    <Paper p="md" shadow="sm">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={3}>Create WhatsApp Campaign</Title>
          <Button variant="default" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Group>

        <Stepper active={activeStep} onStepClick={setActiveStep}>
          <Stepper.Step label="Campaign Details" description="Name & Template">
            <Stack gap="md" mt="lg">
              <TextInput
                label="Campaign Name"
                placeholder="Black Friday Promo"
                required
                {...form.getInputProps("name")}
              />

              <Select
                label="WhatsApp Account"
                placeholder="Select account"
                required
                data={accounts.map((acc) => ({
                  value: acc.id.toString(),
                  label: `${acc.phone_number} - ${acc.display_name}`,
                }))}
                {...form.getInputProps("accountId")}
                disabled={accountsLoading}
              />

              <Select
                label="Message Template"
                placeholder="Select approved template"
                required
                data={templates.map((tpl) => ({
                  value: tpl.id.toString(),
                  label: tpl.name,
                }))}
                {...form.getInputProps("templateId")}
                disabled={templatesLoading || !form.values.accountId}
              />

              {selectedTemplate && (
                <Paper p="sm" bg="gray.0" withBorder>
                  <Text size="sm" fw={500} mb="xs">
                    Template Preview:
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedTemplate.body}
                  </Text>
                </Paper>
              )}
            </Stack>
          </Stepper.Step>

          <Stepper.Step
            label="Upload Recipients"
            description="CSV with phone numbers"
          >
            <Stack gap="md" mt="lg">
              <FileInput
                label="Upload CSV File"
                description="CSV must include a 'phone_number' column in E.164 format (+[country][number])"
                placeholder="Select CSV file"
                accept=".csv"
                leftSection={<IconFileSpreadsheet size={18} />}
                onChange={handleFileUpload}
              />

              {csvData.length > 0 && (
                <>
                  <Alert color="green" icon={<IconCheck size={16} />}>
                    Loaded {csvData.length} recipients from CSV
                  </Alert>

                  {templateParams.length > 0 && (
                    <Stack gap="xs">
                      <Text size="sm" fw={500}>
                        Map Template Parameters:
                      </Text>
                      {templateParams.map((paramNum) => (
                        <Select
                          key={paramNum}
                          label={`Parameter {{${paramNum}}}`}
                          placeholder="Select CSV column"
                          data={csvHeaders.map((h) => ({
                            value: h,
                            label: h,
                          }))}
                          value={paramMapping[paramNum]}
                          onChange={(value) =>
                            setParamMapping((prev) => ({
                              ...prev,
                              [paramNum]: value || "",
                            }))
                          }
                        />
                      ))}
                    </Stack>
                  )}

                  <Text size="sm" fw={500}>
                    Preview (first 5 rows):
                  </Text>
                  <Paper withBorder>
                    <Table.ScrollContainer minWidth={500}>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            {csvHeaders.map((header) => (
                              <Table.Th key={header}>{header}</Table.Th>
                            ))}
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {csvData.slice(0, 5).map((row, idx) => (
                            <Table.Tr key={idx}>
                              {csvHeaders.map((header) => (
                                <Table.Td key={header}>{row[header]}</Table.Td>
                              ))}
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Table.ScrollContainer>
                  </Paper>
                </>
              )}
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Settings" description="Schedule & Limits">
            <Stack gap="md" mt="lg">
              <TextInput
                label="Daily Sending Limit"
                description="Maximum messages to send per day (Twilio limits apply)"
                type="number"
                {...form.getInputProps("dailySendingLimit")}
              />

              <TextInput
                label="Schedule Start Time (Optional)"
                description="Leave blank to start immediately"
                type="datetime-local"
                {...form.getInputProps("scheduledAt")}
              />

              <Paper p="md" withBorder>
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>
                      Enable Team Assignment
                    </Text>
                    <Text size="xs" c="dimmed">
                      Route replies to team members
                    </Text>
                  </Stack>
                  <TextInput // Should be switch, but using simple checkbox for now or switch if available
                    type="checkbox"
                    {...form.getInputProps("teamAssignmentEnabled", {
                      type: "checkbox",
                    })}
                    style={{ width: 20, height: 20 }}
                  />
                </Group>
              </Paper>
            </Stack>
          </Stepper.Step>

          <Stepper.Step label="Review & Send" description="Confirm details">
            <Stack gap="md" mt="lg">
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Campaign Name:
                    </Text>
                    <Text size="sm" fw={500}>
                      {form.values.name}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Template:
                    </Text>
                    <Text size="sm" fw={500}>
                      {selectedTemplate?.name}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Total Recipients:
                    </Text>
                    <Text size="sm" fw={500}>
                      {csvData.length}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Daily Limit:
                    </Text>
                    <Text size="sm" fw={500}>
                      {form.values.dailySendingLimit}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Start Time:
                    </Text>
                    <Text size="sm" fw={500}>
                      {form.values.scheduledAt
                        ? new Date(form.values.scheduledAt).toLocaleString()
                        : "Immediately"}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              {csvData.length > 0 && (
                <Paper p="sm" bg="gray.0" withBorder>
                  <Text size="sm" fw={500} mb="xs">
                    Sample Message (first recipient):
                  </Text>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedTemplate?.body.replace(
                      /\{\{(\d+)\}\}/g,
                      (match: string, num: string) => {
                        const column = paramMapping[parseInt(num)];
                        return column && csvData[0]
                          ? csvData[0][column]
                          : match;
                      },
                    )}
                  </Text>
                </Paper>
              )}

              {createMutation.isError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Error"
                  color="red"
                >
                  Failed to create campaign. Please try again.
                </Alert>
              )}
            </Stack>
          </Stepper.Step>
        </Stepper>

        <Group justify="space-between" mt="xl">
          <Button
            variant="default"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          {activeStep < 3 ? (
            <Button onClick={handleNext} color="green">
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              color="green"
              loading={createMutation.isLoading}
            >
              {form.values.scheduledAt
                ? "Schedule Campaign"
                : "Create & Start Campaign"}
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
};

export default CreateWhatsAppCampaign;

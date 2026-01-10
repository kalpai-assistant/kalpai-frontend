import React, { useMemo } from "react";
import {
  Paper,
  Stack,
  Text,
  Group,
  Button,
  Modal,
  Divider,
  Box,
} from "@mantine/core";
import { IconEye } from "@tabler/icons-react";

interface TemplatePreviewProps {
  subject: string;
  template: string;
  imageMappings: Array<{
    placeholder: string;
    previewUrl?: string;
  }>;
  sampleData?: {
    name?: string;
    company_name?: string;
    location?: string;
    email?: string;
    phone_number?: string;
  };
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  subject,
  template,
  imageMappings,
  sampleData = {
    name: "John Doe",
    company_name: "Acme Corp",
    location: "San Francisco",
    email: "john@example.com",
    phone_number: "+1 234-567-8900",
  },
}) => {
  const [opened, setOpened] = React.useState(false);

  // Replace placeholders with sample data and images
  const previewContent = useMemo(() => {
    let content = template;

    // Replace variable placeholders with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{?${key}\\}?\\}`, "g");
      content = content.replace(regex, value || `[${key}]`);
    });

    // Replace image placeholders with actual images or placeholders
    imageMappings.forEach((mapping) => {
      const regex = new RegExp(`\\{\\{${mapping.placeholder}\\}\\}`, "g");
      if (mapping.previewUrl) {
        // Replace with actual image HTML
        content = content.replace(
          regex,
          `<img src="${mapping.previewUrl}" alt="${mapping.placeholder}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`,
        );
      } else {
        // Show placeholder text
        content = content.replace(
          regex,
          `<div style="background: #f0f0f0; padding: 40px; text-align: center; border-radius: 8px; margin: 10px 0; color: #999;">[${mapping.placeholder} - Not uploaded]</div>`,
        );
      }
    });

    // Convert line breaks to HTML
    content = content.replace(/\n/g, "<br />");

    return content;
  }, [template, imageMappings, sampleData]);

  const previewSubject = useMemo(() => {
    let subjectLine = subject;
    Object.entries(sampleData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{?${key}\\}?\\}`, "g");
      subjectLine = subjectLine.replace(regex, value || `[${key}]`);
    });
    return subjectLine;
  }, [subject, sampleData]);

  const hasContent = template.trim().length > 0;

  return (
    <>
      <Button
        leftSection={<IconEye size={16} />}
        variant="light"
        onClick={() => setOpened(true)}
        disabled={!hasContent}
      >
        Preview Email
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Email Preview"
        size="lg"
      >
        <Stack gap="md">
          <Paper p="md" withBorder style={{ backgroundColor: "#f9f9f9" }}>
            <Stack gap="xs">
              <Group gap="xs">
                <Text size="xs" c="dimmed" fw={500}>
                  From:
                </Text>
                <Text size="xs">your-email@gmail.com</Text>
              </Group>
              <Group gap="xs">
                <Text size="xs" c="dimmed" fw={500}>
                  To:
                </Text>
                <Text size="xs">{sampleData.email}</Text>
              </Group>
              <Divider my="xs" />
              <Group gap="xs">
                <Text size="sm" fw={600}>
                  Subject:
                </Text>
                <Text size="sm">{previewSubject}</Text>
              </Group>
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Box
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#333",
              }}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </Paper>

          <Paper p="xs" withBorder style={{ backgroundColor: "#fff3cd" }}>
            <Text size="xs" c="dimmed" ta="center">
              This is a preview with sample data. Actual emails will use real
              contact information.
            </Text>
          </Paper>
        </Stack>
      </Modal>
    </>
  );
};

export default TemplatePreview;

import React from "react";
import { Paper, Text, Badge, Group, Stack, Code } from "@mantine/core";
import { IconTemplate, IconCircleCheck } from "@tabler/icons-react";
import type {
  WhatsAppTemplate,
  TemplateStatus,
} from "../../../../../api/requests_responses/outreach/whatsapp";

interface WhatsAppTemplateCardProps {
  template: WhatsAppTemplate;
}

const WhatsAppTemplateCard: React.FC<WhatsAppTemplateCardProps> = ({
  template,
}) => {
  const getStatusColor = (status: TemplateStatus): string => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "PENDING":
        return "yellow";
      case "REJECTED":
        return "red";
      default:
        return "gray";
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "MARKETING":
        return "blue";
      case "UTILITY":
        return "cyan";
      case "AUTHENTICATION":
        return "violet";
      default:
        return "gray";
    }
  };

  return (
    <Paper p="md" shadow="sm" withBorder>
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconTemplate size={20} />
            <Text fw={600} size="md">
              {template.name}
            </Text>
          </Group>
          {template.status === "APPROVED" && (
            <IconCircleCheck size={20} color="green" />
          )}
        </Group>

        <Group gap="xs">
          <Badge color={getCategoryColor(template.category)} variant="light">
            {template.category}
          </Badge>
          <Badge color={getStatusColor(template.status)} variant="dot">
            {template.status}
          </Badge>
        </Group>

        <Paper p="sm" bg="gray.0" withBorder>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {template.body}
          </Text>
        </Paper>

        {template.footer && (
          <Text size="xs" c="dimmed" fs="italic">
            Footer: {template.footer}
          </Text>
        )}

        {template.buttons && template.buttons.length > 0 && (
          <Group gap="xs">
            <Text size="xs" c="dimmed">
              Buttons:
            </Text>
            {template.buttons.map((btn, idx) => (
              <Badge key={idx} size="xs" variant="outline">
                {btn.text}
              </Badge>
            ))}
          </Group>
        )}

        <Group justify="space-between" mt="xs">
          <Text size="xs" c="dimmed">
            Language: <Code>{template.language}</Code>
          </Text>
          <Text size="xs" c="dimmed">
            Created: {new Date(template.created_time).toLocaleDateString()}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default WhatsAppTemplateCard;

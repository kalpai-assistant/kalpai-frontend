import React from "react";
import { Card, Text, Group, Button } from "@mantine/core";
import {
  IconUsers,
  IconCalendar,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { EmailList } from "../../../../../api/requests_responses/outreach/email";

interface EmailListCardProps {
  list: EmailList;
  onView: (listId: number) => void;
  onDelete: (listId: number) => void;
}

const EmailListCard: React.FC<EmailListCardProps> = ({
  list,
  onView,
  onDelete,
}) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={500} size="lg">
            {list.name}
          </Text>
          {list.description && (
            <Text size="sm" c="dimmed" mt={4}>
              {list.description}
            </Text>
          )}
        </div>
      </Group>

      <Group gap="md" mt="md">
        <Group gap={4}>
          <IconUsers size={16} />
          <Text size="sm" fw={500}>
            {list.total_contacts}
          </Text>
          <Text size="xs" c="dimmed">
            contacts
          </Text>
        </Group>
        <Group gap={4}>
          <IconCalendar size={16} />
          <Text size="xs" c="dimmed">
            Created {new Date(list.created_time).toLocaleDateString()}
          </Text>
        </Group>
      </Group>

      <Group gap="xs" mt="md">
        <Button
          variant="light"
          size="sm"
          leftSection={<IconEye size={16} />}
          onClick={() => onView(list.id)}
        >
          View
        </Button>
        <Button
          variant="subtle"
          color="red"
          size="sm"
          leftSection={<IconTrash size={16} />}
          onClick={() => onDelete(list.id)}
        >
          Delete
        </Button>
      </Group>
    </Card>
  );
};

export default EmailListCard;

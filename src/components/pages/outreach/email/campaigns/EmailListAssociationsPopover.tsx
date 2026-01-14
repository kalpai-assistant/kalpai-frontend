import { Popover, Text, Stack, Paper, Group, Box, Badge } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { EmailListAssociation } from "../../../../../api/requests_responses/outreach/email";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface EmailListAssociationsPopoverProps {
  associations: EmailListAssociation[];
  totalRecipients: number;
}

const EmailListAssociationsPopover: React.FC<
  EmailListAssociationsPopoverProps
> = ({ associations, totalRecipients }) => {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(false);

  if (!associations || associations.length === 0) {
    return (
      <Group gap={4} wrap="nowrap">
        <Text size="sm" fw={500}>
          {totalRecipients}
        </Text>
      </Group>
    );
  }

  return (
    <Popover
      position="bottom"
      withArrow
      shadow="md"
      withinPortal
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Group
          gap={4}
          wrap="nowrap"
          style={{ cursor: "pointer" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpened((o) => !o);
          }}
          onMouseEnter={() => setOpened(true)}
          onMouseLeave={() => setOpened(false)}
        >
          <Text size="sm" fw={500}>
            {totalRecipients}
          </Text>
          <IconInfoCircle
            size={16}
            style={{ opacity: 0.6, cursor: "pointer" }}
          />
        </Group>
      </Popover.Target>
      <Popover.Dropdown
        p="sm"
        onMouseEnter={() => setOpened(true)}
        onMouseLeave={() => setOpened(false)}
      >
        <Stack gap="xs" style={{ minWidth: 250 }}>
          <Text size="sm" fw={600} mb={4}>
            Email Lists ({associations.length})
          </Text>
          {associations.map((list) => (
            <Paper
              key={list.id}
              p="xs"
              withBorder
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/outreach/email/lists/${list.id}`);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--mantine-color-gray-0)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1, overflow: "hidden" }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {list.name}
                  </Text>
                  {list.description && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {list.description}
                    </Text>
                  )}
                </Box>
                <Badge variant="light" size="sm">
                  {list.total_contacts}
                </Badge>
              </Group>
            </Paper>
          ))}
          <Box
            pt="xs"
            mt="xs"
            style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Text size="xs" c="dimmed">
              Total Recipients: <strong>{totalRecipients}</strong>
            </Text>
          </Box>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmailListAssociationsPopover;

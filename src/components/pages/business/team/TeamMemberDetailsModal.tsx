import {
  Modal,
  Text,
  Flex,
  Badge,
  Paper,
  Group,
  Button,
  Divider,
  Avatar,
} from "@mantine/core";
import { TeamMember } from "../../../../api/requests_responses/team";
import {
  IconMail,
  IconClock,
  IconCalendar,
  IconEdit,
  IconTrash,
  IconShieldCheck,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { formatDistanceToNow } from "date-fns";

interface TeamMemberDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onEdit: (member: TeamMember) => void;
  onRemove: (memberId: number) => void;
}

const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({
  opened,
  onClose,
  member,
  onEdit,
  onRemove,
}) => {
  if (!member) return null;

  const getRoleTypeBadgeColor = (roleType: string) => {
    const colors: Record<string, string> = {
      owner: "blue",
      admin: "violet",
      member: "green",
      viewer: "gray",
    };
    return colors[roleType] || "gray";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "green",
      pending: "yellow",
      declined: "red",
    };
    return colors[status] || "gray";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const handleRemoveClick = () => {
    modals.openConfirmModal({
      title: "Remove Team Member",
      children: (
        <Text size="sm">
          Are you sure you want to remove{" "}
          <strong>{member.name || member.email}</strong> from the team? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        onRemove(member.id);
        onClose();
      },
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      centered
      transitionProps={{ transition: "slide-up", duration: 300 }}
    >
      {/* Hero Section */}
      <Flex direction="column" align="center" mb="xl">
        <Avatar size={80} radius={80} mb="md" color="blue">
          {getInitials(member.name)}
        </Avatar>
        <Text size="xl" fw={600}>
          {member.name || "No Name"}
        </Text>
        <Text size="sm" c="dimmed">
          {member.role || "No Role Specified"}
        </Text>
        <Group mt="xs" gap="xs">
          <Badge
            color={getRoleTypeBadgeColor(member.role_type)}
            variant="light"
          >
            {member.role_type.toUpperCase()}
          </Badge>
          <Badge
            color={getStatusBadgeColor(member.invitation_status)}
            variant="filled"
          >
            {member.invitation_status.toUpperCase()}
          </Badge>
        </Group>
      </Flex>

      {/* Information Sections */}
      <Flex direction="column" gap="md">
        {/* Contact Info */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="sm">
            Contact Information
          </Text>
          <Flex align="center" gap="xs">
            <IconMail size={16} style={{ opacity: 0.6 }} />
            <Text size="sm">{member.email}</Text>
          </Flex>
        </Paper>

        {/* Role & Description */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="sm">
            Role & Responsibilities
          </Text>
          <Flex direction="column" gap="xs">
            <Flex align="center" gap="xs">
              <IconShieldCheck size={16} style={{ opacity: 0.6 }} />
              <Text size="sm">
                <strong>Role Type:</strong> {member.role_type}
              </Text>
            </Flex>
            {member.description && (
              <Text size="sm" c="dimmed" style={{ marginLeft: 24 }}>
                {member.description}
              </Text>
            )}
          </Flex>
        </Paper>

        {/* Activity Timeline */}
        <Paper p="md" withBorder>
          <Text size="sm" fw={600} mb="sm">
            Activity Timeline
          </Text>
          <Flex direction="column" gap="xs">
            {member.invited_at && (
              <Flex align="center" gap="xs">
                <IconCalendar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm">
                  <strong>Invited:</strong> {formatDate(member.invited_at)}
                </Text>
              </Flex>
            )}
            {member.accepted_at && (
              <Flex align="center" gap="xs">
                <IconCalendar size={16} style={{ opacity: 0.6 }} />
                <Text size="sm">
                  <strong>Accepted:</strong> {formatDate(member.accepted_at)}
                </Text>
              </Flex>
            )}
            {member.last_login && (
              <Flex align="center" gap="xs">
                <IconClock size={16} style={{ opacity: 0.6 }} />
                <Text size="sm">
                  <strong>Last Login:</strong> {formatDate(member.last_login)}
                </Text>
              </Flex>
            )}
          </Flex>
        </Paper>
      </Flex>

      <Divider my="md" />

      {/* Action Buttons */}
      <Group justify="space-between">
        <Button
          variant="subtle"
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={handleRemoveClick}
        >
          Remove Member
        </Button>
        <Group>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          <Button
            leftSection={<IconEdit size={16} />}
            onClick={() => {
              onEdit(member);
              onClose();
            }}
          >
            Edit
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default TeamMemberDetailsModal;

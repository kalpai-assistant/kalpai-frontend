import {
  Table,
  Badge,
  ActionIcon,
  Menu,
  Avatar,
  Text,
  Flex,
  Card,
  Group,
  Skeleton,
} from "@mantine/core";
import { TeamMember } from "../../../../api/requests_responses/team";
import {
  IconDots,
  IconEdit,
  IconTrash,
  IconMailForward,
  IconUserCheck,
  IconClock,
  IconUserX,
} from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { useMediaQuery } from "@mantine/hooks";

interface TeamMemberListProps {
  members: TeamMember[];
  loading: boolean;
  onMemberClick: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
  onRemove: (memberId: number) => void;
  onResendInvitation: (memberId: number) => void;
}

const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  loading,
  onMemberClick,
  onEdit,
  onRemove,
  onResendInvitation,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getRoleTypeBadgeColor = (roleType: string) => {
    const colors: Record<string, string> = {
      owner: "blue",
      admin: "violet",
      member: "green",
      viewer: "gray",
    };
    return colors[roleType] || "gray";
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      active: { color: "green", icon: IconUserCheck },
      pending: { color: "yellow", icon: IconClock },
      declined: { color: "red", icon: IconUserX },
    };
    const { color, icon: Icon } = config[status] || {
      color: "gray",
      icon: IconClock,
    };

    return (
      <Badge color={color} variant="light" leftSection={<Icon size={12} />}>
        {status.toUpperCase()}
      </Badge>
    );
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
    if (!dateString) return "Never";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <Flex direction="column" gap="md">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={60} radius="md" />
        ))}
      </Flex>
    );
  }

  if (members.length === 0) {
    return (
      <Card withBorder p="xl" radius="md">
        <Flex direction="column" align="center" gap="md">
          <IconUserCheck size={48} style={{ opacity: 0.3 }} />
          <Text size="lg" fw={500} c="dimmed">
            No team members found
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            Invite team members to collaborate on your business
          </Text>
        </Flex>
      </Card>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <Flex direction="column" gap="md">
        {members.map((member) => (
          <Card
            key={member.id}
            withBorder
            p="md"
            radius="md"
            style={{
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() => onMemberClick(member)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <Flex justify="space-between" align="flex-start">
              <Flex gap="md" align="center">
                <Avatar color="blue" radius="xl">
                  {getInitials(member.name)}
                </Avatar>
                <div>
                  <Text fw={500}>{member.name || "No Name"}</Text>
                  <Text size="sm" c="dimmed">
                    {member.email}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {member.role || "No Role"}
                  </Text>
                  <Group gap="xs" mt="xs">
                    <Badge
                      color={getRoleTypeBadgeColor(member.role_type)}
                      size="xs"
                    >
                      {member.role_type.toUpperCase()}
                    </Badge>
                    {getStatusBadge(member.invitation_status)}
                  </Group>
                </div>
              </Flex>
              <Menu position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <IconDots size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(member);
                    }}
                  >
                    Edit
                  </Menu.Item>
                  {member.invitation_status === "pending" && (
                    <Menu.Item
                      leftSection={<IconMailForward size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onResendInvitation(member.id);
                      }}
                    >
                      Resend Invitation
                    </Menu.Item>
                  )}
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(member.id);
                    }}
                  >
                    Remove
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Flex>
          </Card>
        ))}
      </Flex>
    );
  }

  // Desktop Table View
  return (
    <Table.ScrollContainer minWidth={800}>
      <Table highlightOnHover verticalSpacing="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Member</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Last Login</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {members.map((member) => (
            <Table.Tr
              key={member.id}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => onMemberClick(member)}
            >
              <Table.Td>
                <Flex gap="sm" align="center">
                  <Avatar color="blue" radius="xl" size="md">
                    {getInitials(member.name)}
                  </Avatar>
                  <Text fw={500}>{member.name || "No Name"}</Text>
                </Flex>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {member.email}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{member.role || "N/A"}</Text>
              </Table.Td>
              <Table.Td>
                <Badge color={getRoleTypeBadgeColor(member.role_type)}>
                  {member.role_type.toUpperCase()}
                </Badge>
              </Table.Td>
              <Table.Td>{getStatusBadge(member.invitation_status)}</Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {formatDate(member.last_login)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Menu position="bottom-end" withinPortal>
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    {member.invitation_status === "pending" && (
                      <Menu.Item
                        leftSection={<IconMailForward size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onResendInvitation(member.id);
                        }}
                      >
                        Resend Invitation
                      </Menu.Item>
                    )}
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(member.id);
                      }}
                    >
                      Remove
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export default TeamMemberList;

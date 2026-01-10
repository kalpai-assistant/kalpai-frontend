import React, { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Loader,
  Alert,
  Modal,
  Text,
  Table,
  Badge,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { IconPlus, IconAlertCircle, IconTrash } from "@tabler/icons-react";
import {
  getTeamMembers,
  //   addTeamMember,
  removeTeamMember,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";
import AddTeamMemberModal from "./AddTeamMemberModal";

const EmailTeamMembers: React.FC = () => {
  const queryClient = useQueryClient();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  const {
    data: membersResponse,
    isLoading,
    error,
  } = useQuery(EmailOutreachQueryNames.GET_TEAM_MEMBERS, getTeamMembers, {
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation(
    (memberId: number) => removeTeamMember(memberId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_TEAM_MEMBERS);
        setDeleteModalOpen(false);
        setMemberToDelete(null);
      },
    },
  );

  const handleAddComplete = () => {
    setAddModalOpen(false);
  };

  const handleDeleteClick = (memberId: number) => {
    setMemberToDelete(memberId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete);
    }
  };

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Failed to load team members. Please try again.
      </Alert>
    );
  }

  const members = membersResponse?.data?.team_members || [];

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Title order={3}>Team Members</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddModalOpen(true)}
          >
            Add Team Member
          </Button>
        </Group>

        {members.length === 0 ? (
          <Paper p="xl" shadow="sm" withBorder>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed" ta="center">
                No team members yet
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Add team members to CC them on campaign emails
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setAddModalOpen(true)}
              >
                Add Your First Member
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Paper p="md" shadow="sm" withBorder>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {members.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>{member.email}</Table.Td>
                    <Table.Td>{member.name || "-"}</Table.Td>
                    <Table.Td>{member.role || "-"}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={member.is_active ? "green" : "gray"}
                        variant="light"
                      >
                        {member.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        variant="subtle"
                        color="red"
                        size="xs"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => handleDeleteClick(member.id)}
                      >
                        Remove
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      <AddTeamMemberModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onComplete={handleAddComplete}
      />

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Team Member"
      >
        <Text mb="md">
          Are you sure you want to remove this team member? They will no longer
          be CC'd on campaign emails.
        </Text>
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteConfirm}
            loading={deleteMutation.isLoading}
          >
            Remove
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default EmailTeamMembers;

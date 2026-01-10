import React, { useState } from "react";
import {
  Stack,
  Select,
  Switch,
  Group,
  Text,
  Table,
  Badge,
  Loader,
  Paper,
  Alert,
  Pagination,
} from "@mantine/core";
import { useQuery } from "react-query";
import {
  IconAlertCircle,
  IconCheck,
  IconX,
  IconRobot,
  IconUser,
} from "@tabler/icons-react";
import { getCampaignEmailAssignments } from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

// ============================================================================
// Types
// ============================================================================

interface AssignmentsReportProps {
  campaignId: number;
}

// ============================================================================
// Main Component
// ============================================================================

const AssignmentsReport: React.FC<AssignmentsReportProps> = ({
  campaignId,
}) => {
  const [filters, setFilters] = useState({
    team_member_id: undefined as number | undefined,
    is_active: true,
    limit: 25, // Reduced for better pagination
  });
  const [page, setPage] = useState(1);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const { data: assignmentsResponse, isLoading } = useQuery(
    [
      EmailOutreachQueryNames.GET_CAMPAIGN_ASSIGNMENTS,
      campaignId,
      filters,
      page,
    ],
    () =>
      getCampaignEmailAssignments(campaignId, {
        ...filters,
        limit: filters.limit * page,
      }),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  // ============================================================================
  // Derived Data
  // ============================================================================

  const allAssignments = assignmentsResponse?.data?.assignments || [];
  const startIndex = (page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const assignments = allAssignments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allAssignments.length / filters.limit);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (isLoading && assignments.length === 0) {
    return (
      <Group justify="center" p="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">
          Loading assignments...
        </Text>
      </Group>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Text size="lg" fw={600}>
            Email Assignments Report
          </Text>
          <Text size="sm" c="dimmed">
            Track which team members are handling email responses
          </Text>
        </div>
      </Group>

      {/* Filters */}
      <Paper p="md" withBorder>
        <Group gap="md">
          <Switch
            label="Active only"
            checked={filters.is_active}
            onChange={(event) => {
              setFilters({
                ...filters,
                is_active: event.currentTarget.checked,
              });
              setPage(1); // Reset to first page
            }}
          />
          <Select
            label="Results per page"
            data={[
              { value: "10", label: "10 per page" },
              { value: "25", label: "25 per page" },
              { value: "50", label: "50 per page" },
            ]}
            value={String(filters.limit)}
            onChange={(value) => {
              setFilters({ ...filters, limit: parseInt(value || "25") });
              setPage(1); // Reset to first page
            }}
            style={{ width: 160 }}
          />
        </Group>
      </Paper>

      {assignments.length === 0 ? (
        <Paper p="xl" withBorder>
          <Stack align="center" gap="md">
            <IconAlertCircle size={48} stroke={1.5} opacity={0.3} />
            <Text size="md" fw={500} c="dimmed">
              No assignments found
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Email assignments will appear here once responses are received and
              routed to team members by the AI.
            </Text>
          </Stack>
        </Paper>
      ) : (
        <>
          <Paper withBorder>
            <Table.ScrollContainer minWidth={800}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Recipient</Table.Th>
                    <Table.Th>Assigned To</Table.Th>
                    <Table.Th>Assigned At</Table.Th>
                    <Table.Th>Assignment Type</Table.Th>
                    <Table.Th>Reason</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Notified</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {assignments.map((assignment) => (
                    <Table.Tr key={assignment.id}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {assignment.recipient_email}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <div>
                          <Text size="sm" fw={500}>
                            {assignment.team_member_name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {assignment.team_member_email}
                          </Text>
                        </div>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs">
                          {formatDateTime(assignment.assigned_at)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={
                            assignment.assigned_by_system ? "violet" : "blue"
                          }
                          leftSection={
                            assignment.assigned_by_system ? (
                              <IconRobot size={12} />
                            ) : (
                              <IconUser size={12} />
                            )
                          }
                        >
                          {assignment.assigned_by_system ? "AI" : "Manual"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" style={{ maxWidth: 200 }} lineClamp={2}>
                          {assignment.assignment_reason}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {assignment.handled_at ? (
                          <Badge
                            size="sm"
                            color="green"
                            leftSection={<IconCheck size={12} />}
                          >
                            Handled
                          </Badge>
                        ) : (
                          <Badge size="sm" color="yellow">
                            Pending
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {assignment.notification_sent ? (
                          <Badge size="sm" variant="light" color="green">
                            <IconCheck size={12} />
                          </Badge>
                        ) : (
                          <Badge size="sm" variant="light" color="gray">
                            <IconX size={12} />
                          </Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                size="sm"
              />
            </Group>
          )}

          {/* Summary */}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Showing {startIndex + 1}-
              {Math.min(endIndex, allAssignments.length)} of{" "}
              {allAssignments.length} assignment
              {allAssignments.length !== 1 ? "s" : ""}
            </Text>
            {allAssignments.length === filters.limit * page && (
              <Alert
                color="blue"
                icon={<IconAlertCircle size={16} />}
                style={{ flex: 1, maxWidth: 400 }}
              >
                <Text size="xs">
                  There may be more results. Data is limited to{" "}
                  {filters.limit * page} total records.
                </Text>
              </Alert>
            )}
          </Group>
        </>
      )}
    </Stack>
  );
};

export default AssignmentsReport;

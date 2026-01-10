import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Loader,
  Alert,
  Table,
  Pagination,
  Group,
  Text,
  Badge,
} from "@mantine/core";
import { useQuery } from "react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import {
  getListContacts,
  getEmailLists,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";
import { PageSizes } from "../../../../../utils/constants";

const EmailListDetails: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const [page, setPage] = useState(initialPage);

  const {
    data: contactsResponse,
    isLoading,
    error,
  } = useQuery(
    [EmailOutreachQueryNames.GET_LIST_CONTACTS, listId, page],
    () =>
      getListContacts(Number(listId!), {
        page,
        limit: PageSizes.CHAT_HISTORY,
      }),
    {
      enabled: !!listId,
      refetchOnWindowFocus: false,
    },
  );

  const { data: listsResponse } = useQuery(
    EmailOutreachQueryNames.GET_EMAIL_LISTS,
    getEmailLists,
    {
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (page > 0) {
      setSearchParams({ page: String(page) });
    }
  }, [page, setSearchParams]);

  const list = listsResponse?.data?.email_lists.find(
    (l) => l.id === Number(listId),
  );

  if (isLoading) {
    return (
      <Paper p="md" shadow="sm">
        <Loader />
      </Paper>
    );
  }

  if (error || !list) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        Failed to load list details. Please try again.
      </Alert>
    );
  }

  const contacts = contactsResponse?.data?.contacts || [];
  const total = contactsResponse?.data?.total || 0;
  const totalPages = Math.ceil(total / PageSizes.CHAT_HISTORY);

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/outreach/email/lists")}
        >
          Back to Lists
        </Button>
      </Group>

      <Paper p="md" shadow="sm" withBorder>
        <Stack gap="md">
          <div>
            <Title order={3}>{list.name}</Title>
            {list.description && (
              <Text size="sm" c="dimmed" mt="xs">
                {list.description}
              </Text>
            )}
          </div>

          <Group>
            <Badge size="lg" variant="light">
              {total} contacts
            </Badge>
          </Group>

          {contacts.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              No contacts in this list
            </Text>
          ) : (
            <>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Email</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Company</Table.Th>
                    <Table.Th>Location</Table.Th>
                    <Table.Th>Phone</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {contacts.map((contact) => (
                    <Table.Tr key={contact.id}>
                      <Table.Td>{contact.email}</Table.Td>
                      <Table.Td>{contact.name || "-"}</Table.Td>
                      <Table.Td>{contact.company_name || "-"}</Table.Td>
                      <Table.Td>{contact.location || "-"}</Table.Td>
                      <Table.Td>{contact.phone_number || "-"}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={contact.is_unsubscribed ? "red" : "green"}
                          variant="light"
                        >
                          {contact.is_unsubscribed ? "Unsubscribed" : "Active"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {totalPages > 1 && (
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                  mt="md"
                />
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default EmailListDetails;

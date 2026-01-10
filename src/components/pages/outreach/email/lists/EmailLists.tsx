import React, { useState, useRef, useEffect } from "react";
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
  TextInput,
  Box,
  ActionIcon,
  Divider,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import {
  IconPlus,
  IconAlertCircle,
  IconSearch,
  IconUsers,
  IconCalendar,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import {
  getEmailLists,
  deleteEmailList,
} from "../../../../../api/outreach/email";
import {
  EmailOutreachQueryNames,
  EmailList,
} from "../../../../../api/requests_responses/outreach/email";
import styles from "./EmailLists.module.scss";

const EmailLists: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [containerBounds, setContainerBounds] = useState({ left: 0, width: 0 });
  const headerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: listsResponse,
    isLoading,
    error,
  } = useQuery(EmailOutreachQueryNames.GET_EMAIL_LISTS, getEmailLists, {
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation(
    (listId: number) => deleteEmailList(listId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_EMAIL_LISTS);
        setDeleteModalOpen(false);
        setListToDelete(null);
      },
    },
  );

  useEffect(() => {
    if (headerRef.current && containerRef.current) {
      const height = headerRef.current.offsetHeight;
      const rect = containerRef.current.getBoundingClientRect();
      setHeaderHeight(height);
      setContainerBounds({ left: rect.left, width: rect.width });
      document.documentElement.style.setProperty(
        "--header-height",
        `${height}px`,
      );
    }
  }, [listsResponse]);

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        if (headerRef.current && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const shouldBeSticky = containerRect.top < 0;

          setIsSticky(shouldBeSticky);

          // Update container bounds when becoming sticky
          if (shouldBeSticky) {
            setContainerBounds({
              left: containerRect.left,
              width: containerRect.width,
            });
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCreateClick = () => {
    navigate("/outreach/email/lists/create");
  };

  const handleViewClick = (listId: number) => {
    navigate(`/outreach/email/lists/${listId}`);
  };

  const handleDeleteClick = (listId: number) => {
    setListToDelete(listId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (listToDelete) {
      deleteMutation.mutate(listToDelete);
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
        Failed to load email lists. Please try again.
      </Alert>
    );
  }

  const lists = listsResponse?.data?.email_lists || [];
  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <Box
        className={`${styles.container} ${isSticky ? styles.stickyActive : ""}`}
        ref={containerRef}
      >
        <Box
          ref={headerRef}
          className={`${styles.header} ${isSticky ? styles.sticky : ""}`}
          style={
            isSticky
              ? {
                  left: containerBounds.left,
                  width: containerBounds.width,
                }
              : undefined
          }
        >
          <Group justify="space-between" align="center" p="md">
            <Title order={3}>Email Lists</Title>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateClick}
            >
              Create New List
            </Button>
          </Group>

          {lists.length > 0 && (
            <Box px="md" pb="md">
              <TextInput
                placeholder="Search lists..."
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
          )}

          {filteredLists.length > 0 && (
            <>
              <Divider />
              <Box className={styles.listHeader} px="md" py="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 2 }}>
                    List Name
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Contacts
                  </Text>
                  <Text fw={600} size="sm" c="dimmed" style={{ flex: 1 }}>
                    Created
                  </Text>
                  <Box
                    style={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Text fw={600} size="sm" c="dimmed">
                      Actions
                    </Text>
                  </Box>
                </Group>
              </Box>
            </>
          )}
        </Box>

        <Box
          className={styles.listContainer}
          style={
            isSticky
              ? {
                  top: `${headerHeight}px`,
                  height: `calc(100vh - ${headerHeight}px)`,
                  maxHeight: `calc(100vh - ${headerHeight}px)`,
                }
              : undefined
          }
        >
          {filteredLists.length === 0 && lists.length === 0 ? (
            <Paper p="xl" shadow="sm" withBorder m="md">
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed" ta="center">
                  No email lists yet
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  Create your first email list to start organizing contacts
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreateClick}
                >
                  Create Your First List
                </Button>
              </Stack>
            </Paper>
          ) : filteredLists.length === 0 ? (
            <Paper p="xl" shadow="sm" withBorder m="md">
              <Text ta="center" c="dimmed">
                No lists found matching your search
              </Text>
            </Paper>
          ) : (
            <Stack gap={0}>
              {filteredLists.map((list, index) => (
                <EmailListItem
                  key={list.id}
                  list={list}
                  onView={handleViewClick}
                  onDelete={handleDeleteClick}
                  isLast={index === filteredLists.length - 1}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Email List"
      >
        <Text mb="md">
          Are you sure you want to delete this email list? This action cannot be
          undone and all contacts in this list will be removed.
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
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
};

interface EmailListItemProps {
  list: EmailList;
  onView: (listId: number) => void;
  onDelete: (listId: number) => void;
  isLast: boolean;
}

const EmailListItem: React.FC<EmailListItemProps> = ({
  list,
  onView,
  onDelete,
  isLast,
}) => {
  return (
    <>
      <Paper
        className={styles.listItem}
        p="md"
        withBorder
        style={{ borderBottom: isLast ? "1px solid" : "none" }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ flex: 2 }}>
            <Text fw={500} size="md" mb={4}>
              {list.name}
            </Text>
            {list.description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {list.description}
              </Text>
            )}
          </Box>

          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
            <IconUsers size={16} />
            <Text size="sm" fw={500}>
              {list.total_contacts}
            </Text>
            <Text size="xs" c="dimmed">
              contacts
            </Text>
          </Group>

          <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
            <IconCalendar size={16} />
            <Text size="sm" c="dimmed">
              {new Date(list.created_time).toLocaleDateString()}
            </Text>
          </Group>

          <Group gap="xs" style={{ flex: 1 }} justify="flex-end" wrap="nowrap">
            <Button
              variant="light"
              size="sm"
              leftSection={<IconEye size={16} />}
              onClick={() => onView(list.id)}
            >
              View
            </Button>
            <ActionIcon
              variant="subtle"
              color="red"
              size="lg"
              onClick={() => onDelete(list.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    </>
  );
};

export default EmailLists;

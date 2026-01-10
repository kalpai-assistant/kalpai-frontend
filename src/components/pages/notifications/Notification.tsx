import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  NotificationQueryNames,
  NotificationResponse,
} from "../../../api/requests_responses/notifications";
import { useEffect, useState } from "react";
import {
  notificationOpened,
  getNotifications,
} from "../../../api/notifications";
import { ButtonColors, PageSizes } from "../../../utils/constants";
import {
  Flex,
  List,
  Loader,
  Pagination,
  SegmentedControl,
} from "@mantine/core";
import styles from "./Notification.module.scss";
import classNames from "classnames";
import { GoRead, GoUnread } from "react-icons/go";
import Chat from "../chat/Chat";
import { useSearchParams } from "react-router-dom";
import { IconReload } from "@tabler/icons-react";
import { EmptyErrorState } from "../business/CommonUtils";

const Notifications = () => {
  const [notificationState, setNotificationState] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  //   const initialSearchString = searchParams.get("search") || "";
  const queryClient = useQueryClient();
  const [currentChatSessionID, setCurrentChatSessionID] = useState<
    string | undefined
  >(undefined);
  const [page, setPage] = useState(initialPage);
  const {
    data: notificationList,
    isLoading,
    refetch: refetchNotifications,
    isError,
  } = useQuery(
    [NotificationQueryNames.NOTIFICATIONS, page, notificationState],
    () =>
      getNotifications(notificationState, page, PageSizes.CHAT_HISTORY).then(
        (res) => res.data,
      ),
    {
      refetchOnWindowFocus: false,
    },
  );

  const { mutate: updateNotificationOpen } = useMutation(
    NotificationQueryNames.NOTIFICATION_OPEN,
    (notificationID: number) => notificationOpened(notificationID),
    {
      onSuccess: (data) => {
        if (data.data.ok)
          queryClient.invalidateQueries(NotificationQueryNames.NOTIFICATIONS);
      },
    },
  );

  const handleNotificationClick = (notification: NotificationResponse) => {
    if (!notification.opened_time) updateNotificationOpen(notification.id);
    setCurrentChatSessionID(notification.chat_session_id);
  };

  useEffect(() => {
    // Update URL with the current page and searchString when they change
    let params = {};
    if (page > 0) {
      params = { ...params, page: String(page) };
    }
    setSearchParams(params);
  }, [page, setSearchParams]);

  const handleNotificationTypeChange = (value: string) => {
    setNotificationState(value);
    setPage(1);
  };

  useEffect(() => {
    if (notificationList && notificationList.items.length > 0) {
      setCurrentChatSessionID(notificationList.items[0].chat_session_id);
    }
  }, [notificationList]);

  return (
    <Flex className={styles.mainContainer}>
      <Flex direction="column" mih="100%" w="50%">
        <Flex justify="space-between" align="center" mb={12} pr="lg">
          <SegmentedControl
            value={notificationState}
            onChange={handleNotificationTypeChange}
            data={[
              { label: "All", value: "all" },
              { label: "Read", value: "read" },
              { label: "Un-Read", value: "unread" },
            ]}
          />
          <IconReload cursor="pointer" onClick={() => refetchNotifications()} />
        </Flex>
        {isLoading ? (
          <Loader />
        ) : isError || !notificationList || !notificationList.items ? (
          <EmptyErrorState
            subText="There was an issue while loading the Chats"
            buttonText="Restart!"
            color={ButtonColors.RED}
            navigateTo="/"
          />
        ) : notificationList.items.length === 0 ? (
          <EmptyErrorState
            titleText="No notifications found"
            subText="Checkout the interactions in the mean time"
            buttonText="Interactions"
            color={ButtonColors.GRAY}
            navigateTo="/chats"
          />
        ) : (
          <Flex direction="column" h="100%">
            <List className={styles.notificationList}>
              {notificationList &&
                notificationList.items.length > 0 &&
                notificationList.items.map((notification) => (
                  <List.Item
                    key={notification.id}
                    className={classNames(styles.notification, {
                      [styles.selected]:
                        currentChatSessionID === notification.chat_session_id,
                    })}
                    onClick={() => handleNotificationClick(notification)}
                    icon={notification.opened_time ? <GoRead /> : <GoUnread />}
                  >
                    {notification.notification_text}
                  </List.Item>
                ))}
            </List>
            <Pagination
              total={notificationList?.pages || 0}
              value={page}
              onChange={setPage}
              mt="sm"
            />
          </Flex>
        )}
      </Flex>
      {currentChatSessionID && (
        <Flex className={styles.chatWindowWrapper}>
          <Chat
            sessionId={currentChatSessionID}
            showMessageInputBox={false}
            renderAsComponent={true}
            isAdmin
          />
        </Flex>
      )}
    </Flex>
  );
};

export default Notifications;

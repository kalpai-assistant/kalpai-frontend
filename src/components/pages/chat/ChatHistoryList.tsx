import { Flex, List, Text } from "@mantine/core";
import { ChatSessionPageResponse } from "../../../api/requests_responses/chat";
import styles from "./ChatHistoryList.module.scss";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { ReactComponent as DeviceLogo } from "../../../assets/images/svg/deviceLogo.svg";
import { ReactComponent as GlobeLogo } from "../../../assets/images/svg/globeLogo.svg";
import { ReactComponent as LocationLogo } from "../../../assets/images/svg/locationLogo.svg";
import { ReactComponent as AriaiLogo } from "../../../assets/images/svg/ariai_logo.svg";
import { ReactComponent as TelegramLogo } from "../../../assets/images/svg/telegram_logo.svg";
import { ReactComponent as WhatsappLogo } from "../../../assets/images/svg/whatsapp_logo.svg";
import Chat from "./Chat";
import { EmptyErrorState } from "../business/CommonUtils";
import { ButtonColors } from "../../../utils/constants";

interface DetailItem {
  item: string;
  value: string;
  logo: JSX.Element;
}

interface ChatHistoryListProps {
  chats: ChatSessionPageResponse[];
  isSearch: boolean;
  showMetaInfo?: boolean;
  showSourceLogos?: boolean;
}

const ChatHistoryList = ({
  chats,
  isSearch,
  showMetaInfo = true,
  showSourceLogos = false,
}: ChatHistoryListProps) => {
  const [showDetailsID, setShowDetailsID] = useState<string | undefined>(
    undefined,
  );
  const [dataList, setDataList] = useState<DetailItem[] | undefined>(undefined);

  // Logo mapping for different sources
  const getSourceLogo = (source: string) => {
    const logoMap: { [key: string]: JSX.Element } = {
      default: <AriaiLogo width={24} height={24} />,
      telegram: <TelegramLogo width={24} height={24} />,
      whatsapp: <WhatsappLogo width={24} height={24} />,
    };
    return logoMap[source] || logoMap.default;
  };
  const handleDetailsExpandClick = (session: ChatSessionPageResponse) => {
    setDataList([
      {
        item: "Device",
        value: `${session.device}, ${session.os}`,
        logo: <DeviceLogo />,
      },
      {
        item: "Browser/App",
        value: `${session.browser} ${session.browser_version}`,
        logo: <GlobeLogo />,
      },
      { item: "IP Address", value: session.ip, logo: <LocationLogo /> },
    ]);
  };

  const handleViewChatsClick = (session: ChatSessionPageResponse) => {
    setShowDetailsID(session.session_id);
    handleDetailsExpandClick(session);
  };

  useEffect(() => {
    if (chats.length > 0) {
      setShowDetailsID(chats[0].session_id);
      handleDetailsExpandClick(chats[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.mainContainer}>
      {chats.length > 0 ? (
        <List spacing="xs" size="md" left={0} className={styles.list}>
          {chats.map((chat: ChatSessionPageResponse) => (
            <div
              key={chat.session_id}
              className={classNames(styles.item, {
                [styles.selected]: showDetailsID === chat.session_id,
              })}
            >
              <div
                className={styles.infoWrapper}
                onClick={() => handleViewChatsClick(chat)}
              >
                <div className={styles.info}>
                  <div className={styles.insideInfo}>
                    <Text c="dark" size="sm">
                      Location:{" "}
                      {chat.location ? chat.location : chat.coordinates}
                    </Text>
                    <Text c="gray" size="xs">
                      {chat.created_time}
                    </Text>
                  </div>
                </div>
                {showSourceLogos && (
                  <div className={styles.sourceLogo}>
                    {getSourceLogo(chat.source)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </List>
      ) : isSearch ? (
        <Flex left={0} className={styles.list}>
          <Text>No Results found</Text>
        </Flex>
      ) : (
        <EmptyErrorState
          titleText="No Interactions yet"
          subText="Did you add the bot to the Website?"
          buttonText="Dashboard"
          color={ButtonColors.GRAY}
          navigateTo="/"
        />
      )}
      {showDetailsID && (
        <Flex className={styles.chatWindowWrapper}>
          <Chat
            sessionId={showDetailsID}
            showMessageInputBox={false}
            renderAsComponent={true}
            isAdmin
          />
        </Flex>
      )}
      {dataList && showMetaInfo && (
        <Flex w="20%" direction="column" p="md" gap="md">
          {dataList.map((item) => (
            <Flex key={item.item} gap="md" align="center" justify="flex-start">
              {item.logo}
              <Flex direction="column">
                <Text c="gray" size="sm">
                  {item.item}
                </Text>
                <Text size="md">{item.value}</Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}
    </div>
  );
};

export default ChatHistoryList;

import { useQuery } from "react-query";
import { ChatQueryNames } from "../../../api/requests_responses/chat";
import { getBusinessChats } from "../../../api/chat";
import {
  Flex,
  Loader,
  Pagination,
  Pill,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import styles from "./BusinessChatHistory.module.scss";
import ChatHistoryList from "./ChatHistoryList";
import { IconReload, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ButtonColors, PageSizes } from "../../../utils/constants";
import { useSearchParams } from "react-router-dom";
import { EmptyErrorState } from "../business/CommonUtils";

interface BusinessChatHistoryProps {
  sourceType?: string;
  showMetaInfo?: boolean;
  showSourceLogos?: boolean;
}

const ChatHistory: React.FC<BusinessChatHistoryProps> = ({
  sourceType,
  showMetaInfo = true,
  showSourceLogos = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearchString = searchParams.get("search") || "";
  const [searchChatSessionID, setSearchChatSessionID] = useState<string | null>(
    searchParams.get("id") || null,
  );

  const [page, setPage] = useState(initialPage);
  const [searchString, setSearchString] = useState<string>(initialSearchString);
  const {
    data: chats,
    isLoading,
    refetch: refetchInteractions,
    isError,
  } = useQuery(
    [ChatQueryNames.GET_CHAT_LIST, page, searchChatSessionID, sourceType],
    () =>
      getBusinessChats(
        searchString,
        page,
        PageSizes.CHAT_HISTORY,
        searchChatSessionID,
        sourceType,
      ).then((res) => res.data),
    {
      refetchOnWindowFocus: false,
    },
  );

  const handleClearSearch = () => {
    setSearchString("");
    setPage(1);
  };

  useEffect(() => {
    // Update URL with the current page and searchString when they change
    let params = {};
    if (searchString) {
      params = { search: searchString };
    }
    if (page > 0) {
      params = { ...params, page: String(page) };
    }
    if (searchChatSessionID) {
      params = { ...params, id: searchChatSessionID };
    }
    setSearchParams(params);
  }, [page, searchChatSessionID, searchParams, searchString, setSearchParams]);

  return (
    <div className={styles.chatsList}>
      {/* <div className={styles.header}>
        <h2>Interactions</h2>
        <IconReload cursor="pointer" onClick={() => refetch()} />
      </div> */}
      <Flex justify="space-between" align="center" mb={18} w="30%" pr="lg">
        {searchChatSessionID ? (
          <Pill
            withRemoveButton
            onRemove={() => setSearchChatSessionID(null)}
            onClick={() => setSearchChatSessionID(null)}
          >
            <Tooltip label="Click to view all chats">
              <Text size="sm">Focused Chat</Text>
            </Tooltip>
          </Pill>
        ) : (
          <Flex justify="flex-start" gap={4} align="center">
            <TextInput
              placeholder="Search by session ID, device, browser, or IP"
              value={searchString}
              onChange={(event) => setSearchString(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  refetchInteractions();
                }
              }}
            />
            {searchString !== "" && searchString !== undefined && (
              <IconX onClick={handleClearSearch} cursor="pointer" />
            )}
          </Flex>
        )}
        <Flex justify="flex-end" align="center">
          <IconReload cursor="pointer" onClick={() => refetchInteractions()} />
        </Flex>
      </Flex>
      {isError ? (
        <EmptyErrorState
          subText="There was an issue while loading the Chats"
          buttonText="Restart!"
          color={ButtonColors.RED}
          navigateTo="/"
        />
      ) : isLoading || !chats?.items ? (
        <Loader />
      ) : (
        <ChatHistoryList
          chats={chats?.items}
          isSearch={searchString !== "" && searchString !== undefined}
          showMetaInfo={showMetaInfo}
          showSourceLogos={showSourceLogos}
        />
      )}
      <Pagination
        total={chats?.pages || 0}
        value={page}
        onChange={setPage}
        mt="sm"
      />
    </div>
  );
};

export default ChatHistory;

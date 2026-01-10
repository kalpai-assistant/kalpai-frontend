import { Anchor, Box, Flex, Loader, Text } from "@mantine/core";
import styles from "./ChatIntroLine.module.scss";
import { useQuery } from "react-query";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import ChatIntroLineMnager from "./manager/ChatIntroLineManager";
import { BsLightning } from "react-icons/bs";
import { getChatIntroLines, IntroQueryNames } from "../../../../api/intro";
import { ChatIntroLineResponse } from "../../../../api/requests_responses/intro";

const ChatIntroLine: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedChatIntroLine, setSelectedChatIntroLine] =
    useState<ChatIntroLineResponse | null>(null);
  const [chatIntroLines, setChatIntroLines] = useState<ChatIntroLineResponse[]>(
    [],
  );
  const { isLoading, refetch: refetchIntroLines } = useQuery(
    [IntroQueryNames.GET_CHAT_INTRO_LINES],
    () => getChatIntroLines(),
    {
      onSuccess: (data) => {
        let selected = null;
        let otherLines: ChatIntroLineResponse[] = [];

        data.data.forEach((item: ChatIntroLineResponse) => {
          if (item.is_selected) {
            selected = item;
          } else {
            otherLines.push(item);
          }
        });

        setSelectedChatIntroLine(selected);
        setChatIntroLines(otherLines); // ✅ Resets instead of appending
      },
      refetchOnWindowFocus: false,
    },
  );
  return (
    <>
      <Flex direction="column" gap="sm">
        <Flex justify="flex-end" mt="-2rem">
          <Anchor size="sm" underline="always" c="gray" onClick={open}>
            Edit
          </Anchor>
        </Flex>
        {isLoading ? (
          <Loader />
        ) : (
          <Box className={styles.messageBox}>
            <Flex justify="space-between" align="center">
              <Text>{selectedChatIntroLine?.message}</Text>
              {selectedChatIntroLine?.ai_generated && (
                <BsLightning color="#f59e0b" size={16} />
              )}
            </Flex>
          </Box>
        )}
      </Flex>
      <ChatIntroLineMnager
        selectedIntroLine={selectedChatIntroLine}
        introLines={chatIntroLines}
        opened={opened}
        onClose={close}
        refetchLines={refetchIntroLines}
      />
    </>
  );
};

export default ChatIntroLine;

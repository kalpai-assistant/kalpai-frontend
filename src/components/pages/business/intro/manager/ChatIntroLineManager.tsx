import { useState } from "react";
import { Box, Flex, Modal, Text } from "@mantine/core";
import ChatIntroLineItem from "./ChatIntroLineItem";
import ChatIntroLineForm from "./ChatIntroLineForm";
import useChatIntroLineMutations from "./useChatIntroLineMutations";
import styles from "../ChatIntroLine.module.scss";
import TextAreaWithConfirm from "../../../../utilComponents/TextAreaWConfirm";
import { BsLightning } from "react-icons/bs";
import { ChatIntroLineResponse } from "../../../../../api/requests_responses/intro";

interface ChatIntroLineMnagerProps {
  selectedIntroLine?: ChatIntroLineResponse | null;
  introLines?: ChatIntroLineResponse[];
  opened: boolean;
  onClose: () => void;
  refetchLines: () => void;
}

const ChatIntroLineMnager = ({
  selectedIntroLine,
  introLines,
  opened,
  onClose,
  refetchLines,
}: ChatIntroLineMnagerProps) => {
  const [currentLineID, setCurrentLineID] = useState<number | null>(null);
  const [selectedLineEdit, setSelectedLineEdit] = useState<boolean>(false);
  const [currentMessage, setCurrentMessage] = useState<string>(
    selectedIntroLine?.message || "",
  );

  const { updateIntroLine } = useChatIntroLineMutations(refetchLines);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        /** ✅ Now, This is the Proper Title Inside the Modal */
        <Flex w="100%">
          <Box w="100%">
            {selectedLineEdit ? (
              <TextAreaWithConfirm
                value={currentMessage}
                handleChange={setCurrentMessage}
                onSubmit={() => {
                  if (selectedIntroLine) {
                    updateIntroLine({
                      id: selectedIntroLine.id,
                      message: currentMessage || "",
                    });
                  }
                  setSelectedLineEdit(false);
                }}
                onCancel={() => setSelectedLineEdit(false)}
              />
            ) : (
              <Box
                onClick={() => {
                  setSelectedLineEdit(true);
                  setCurrentMessage(selectedIntroLine?.message || "");
                }}
                className={styles.messageBox}
                w="100%"
              >
                <Flex justify="space-between" align="center">
                  <Text>{selectedIntroLine?.message}</Text>
                  {selectedIntroLine?.ai_generated && (
                    <BsLightning color="#f59e0b" size={16} />
                  )}
                </Flex>
              </Box>
            )}
          </Box>
        </Flex>
      }
    >
      <Flex justify="center" align="center" direction="column" gap="md">
        <ChatIntroLineForm
          introLines={introLines?.length || 0}
          refetchLines={refetchLines}
        />
        {introLines?.map((line) => (
          <ChatIntroLineItem
            key={line.id}
            line={line}
            currentLineID={currentLineID}
            setCurrentLineID={setCurrentLineID}
            refetchLines={refetchLines}
          />
        ))}
      </Flex>
    </Modal>
  );
};

export default ChatIntroLineMnager;

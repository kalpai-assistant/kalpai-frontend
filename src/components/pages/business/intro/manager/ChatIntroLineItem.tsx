import { useState, useRef } from "react";
import { Box, Flex, LoadingOverlay, Text } from "@mantine/core";
import { FaCheck, FaPen, FaTrash } from "react-icons/fa";
import { BsLightning } from "react-icons/bs";
import classNames from "classnames";
import styles from "../ChatIntroLine.module.scss";
import TextAreaWithConfirm from "../../../../utilComponents/TextAreaWConfirm";
import useChatIntroLineMutations from "./useChatIntroLineMutations";
import { ChatIntroLineResponse } from "../../../../../api/requests_responses/intro";

interface ChatIntroLineItemProps {
  line: ChatIntroLineResponse;
  currentLineID: number | null;
  setCurrentLineID: (id: number | null) => void;
  refetchLines: () => void;
}

const ChatIntroLineItem = ({
  line,
  currentLineID,
  setCurrentLineID,
  refetchLines,
}: ChatIntroLineItemProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(line.message);
  const actionRef = useRef<HTMLDivElement | null>(null);

  const { updateIntroLine, deleteIntroLine, selectIntroLine, isLoading } =
    useChatIntroLineMutations(refetchLines);

  return (
    <Box
      key={line.id}
      onMouseEnter={() => !currentLineID && setCurrentLineID(line.id)}
      onMouseLeave={() => !isEdit && setCurrentLineID(null)}
      className={classNames(styles.messageBox, {
        [styles.inList]: true,
      })}
      w="100%"
    >
      <LoadingOverlay
        visible={currentLineID === line.id && !isEdit}
        loaderProps={{
          children: (
            <Flex gap="lg" align="center" justify="center" ref={actionRef}>
              <FaCheck onClick={() => selectIntroLine(line.id)} />
              <FaPen onClick={() => setIsEdit(true)} />
              <FaTrash onClick={() => deleteIntroLine(line.id)} />
            </Flex>
          ),
        }}
      />
      {currentLineID === line.id && isEdit && !isLoading ? (
        <TextAreaWithConfirm
          value={currentMessage}
          handleChange={setCurrentMessage}
          onSubmit={() => {
            setIsEdit(false);
            updateIntroLine({ id: line.id, message: currentMessage });
          }}
          onCancel={() => setIsEdit(false)}
        />
      ) : (
        <Flex justify="space-between" align="center">
          <Text c="gray">{line?.message}</Text>
          {line.ai_generated && <BsLightning color="#f59e0b" size={16} />}
        </Flex>
      )}
    </Box>
  );
};

export default ChatIntroLineItem;

import { useState } from "react";
import { Flex, Text } from "@mantine/core";
import { FaPlusCircle } from "react-icons/fa";
import useChatIntroLineMutations from "./useChatIntroLineMutations";
import styles from "../ChatIntroLine.module.scss";
import TextAreaWithConfirm from "../../../../utilComponents/TextAreaWConfirm";

interface ChatIntroLineFormProps {
  introLines: number;
  refetchLines: () => void;
}

const ChatIntroLineForm = ({
  introLines,
  refetchLines,
}: ChatIntroLineFormProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  const { addIntroLine } = useChatIntroLineMutations(refetchLines);

  return (
    <Flex align="center" justify="center" w="100%">
      {isAdding ? (
        <TextAreaWithConfirm
          placeHolder="Make some magic!"
          value={currentMessage}
          handleChange={setCurrentMessage}
          onSubmit={() => {
            addIntroLine(currentMessage);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <Flex
          onClick={() => {
            setCurrentMessage("");
            setIsAdding(true);
          }}
          direction="column"
          gap="xs"
          className={styles.addIntro}
        >
          <FaPlusCircle cursor="pointer" size={24} />
          <Text size="sm" c="gray">
            You Can add up to {4 - introLines} more intros
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default ChatIntroLineForm;

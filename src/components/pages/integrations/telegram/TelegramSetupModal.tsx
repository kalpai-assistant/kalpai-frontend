import React from "react";
import { Modal, Text, Flex } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import TelegramSetupForm from "./TelegramSetupForm";

interface TelegramSetupModalProps {
  opened: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

const TelegramSetupModal: React.FC<TelegramSetupModalProps> = ({
  opened,
  onClose,
  onSetupComplete,
}) => {
  const handleSetupComplete = () => {
    onSetupComplete();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Flex align="center" gap="sm">
          <IconRobot size="1.5rem" />
          <Text size="lg" fw={600}>
            Telegram Bot Integration
          </Text>
        </Flex>
      }
      size="lg"
      centered
    >
      <TelegramSetupForm
        onSetupComplete={handleSetupComplete}
        showTitle={false}
      />
    </Modal>
  );
};

export default TelegramSetupModal;

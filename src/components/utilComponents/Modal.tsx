import React from "react";
import { Modal, ModalProps, Button, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ReactNode } from "react";

interface GenericModalProps extends Omit<ModalProps, "opened" | "onClose"> {
  // Exclude opened and onClose from ModalProps
  buttonDisplayText?: string; // Text for the button
  buttonDisplayIcon?: ReactNode; // Icon for the button or div
  displayOnlyIcon?: boolean; // Show only an icon as the trigger
  disclosure?: [boolean, { open: () => void; close: () => void }]; // Optional external disclosure
  showButton?: boolean;
}

export const GenericModal: React.FC<GenericModalProps> = ({
  buttonDisplayText,
  buttonDisplayIcon,
  displayOnlyIcon = false,
  disclosure,
  showButton = true,
  children,
  ...modalProps // Spread other Mantine Modal props
}) => {
  // Use internal disclosure if none is provided
  const [internalOpened, { open: internalOpen, close: internalClose }] =
    useDisclosure(false);
  const [opened, { open, close }] = disclosure || [
    internalOpened,
    { open: internalOpen, close: internalClose },
  ];

  return (
    <>
      {/* Modal */}
      <Modal
        opened={opened} // Explicitly prioritize this
        onClose={close} // Explicitly prioritize this
        {...modalProps} // Pass other props
      >
        {children}
      </Modal>

      {/* Trigger */}
      {showButton &&
        (displayOnlyIcon ? (
          <ActionIcon onClick={open}>{buttonDisplayIcon}</ActionIcon>
        ) : (
          <Button onClick={open}>
            {buttonDisplayIcon && buttonDisplayIcon}
            {buttonDisplayText}
          </Button>
        ))}
    </>
  );
};

import React from "react";
import { Modal } from "@mantine/core";
import ImageCarousel from "./ImageCarousel";

interface ImageModalProps {
  opened: boolean;
  onClose: () => void;
  images: string[];
  messages: string[];
  initialSlide: number;
}

const ImageModal: React.FC<ImageModalProps> = ({
  opened,
  onClose,
  images,
  messages,
  initialSlide,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="90%"
      padding={0}
      withCloseButton
      closeButtonProps={{ "aria-label": "Close modal" }}
      styles={{
        root: {
          zIndex: 9999,
        },
        inner: {
          zIndex: 9998,
        },
        content: {
          margin: "auto",
          backgroundColor: "rgba(0, 0, 0, 0.25)",
        },
        header: {
          backgroundColor: "transparent",
        },
        body: {
          backgroundColor: "transparent",
        },
      }}
    >
      <ImageCarousel
        images={images}
        messages={messages}
        initialSlide={initialSlide}
        height="100%"
        slideSize="100%"
      />
    </Modal>
  );
};

export default ImageModal;

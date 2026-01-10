import {
  Button,
  Modal,
  Stack,
  Text,
  Avatar,
  Center,
  Flex,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useState } from "react";
import { useChatIntroImageMutations } from "./useChatIntroImageMutations";
import { ChatIntroImageResponse } from "../../../../../api/requests_responses/intro";
import ImageCarousel from "../../../../../utils/components/ImageCarousel";
import { FaPlusCircle, FaImage, FaTrash } from "react-icons/fa";
import styles from "../ChatIntroImage.module.scss";

interface ChatIntroImageManagerProps {
  introImages: ChatIntroImageResponse[];
  opened: boolean;
  onClose: () => void;
}

const ChatIntroImageManager: React.FC<ChatIntroImageManagerProps> = ({
  introImages,
  opened,
  onClose,
}) => {
  const [isFileDragged, setIsFileDragged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addMutation, deleteMutation } = useChatIntroImageMutations();

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    formData.append("descriptions", Array(files.length).fill("").join(","));

    setIsUploading(true);
    try {
      await addMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (introImages.length === 0) return;
    try {
      await deleteMutation.mutateAsync(introImages[selectedImageIndex].id);
      // Reset to first image if we're deleting the last one
      if (selectedImageIndex === introImages.length - 1) {
        setSelectedImageIndex(0);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Intro Images"
      size="xl"
      styles={{
        body: {
          padding: 0,
        },
      }}
    >
      <Stack p="md" style={{ flex: 1 }}>
        <Dropzone
          onDrop={(files) => handleFileUpload(files)}
          onDragEnter={() => setIsFileDragged(true)}
          onDragLeave={() => setIsFileDragged(false)}
          accept={["image/jpeg", "image/png", "image/gif"]}
          multiple={true}
          activateOnClick={false}
          loading={isUploading}
          className={
            isFileDragged ? styles.dragOverlay : styles.managerDropzone
          }
        >
          {introImages.length > 0 ? (
            <ImageCarousel
              images={introImages.map((img) => img.image_url)}
              hoverTexts={introImages.map((img) => img.description || "")}
              height={350}
              slideSize="70%"
              withControls
              withIndicators
              style={{ marginTop: 20 }}
              initialSlide={selectedImageIndex}
              onSlideChange={(index) => setSelectedImageIndex(index)}
            />
          ) : (
            <Center className={styles.emptyStateManager}>
              <Stack align="center" gap="xs">
                <FaImage size={48} color="#666" />
                <Text size="lg" c="dimmed">
                  No images added yet
                </Text>
                <Text size="sm" c="dimmed">
                  Drag and drop images here or click the button below
                </Text>
              </Stack>
            </Center>
          )}
        </Dropzone>

        {introImages.length > 0 && (
          <Flex justify="center" mt="md">
            <Button
              variant="light"
              color="red"
              onClick={handleDelete}
              loading={deleteMutation.isLoading}
            >
              <FaTrash size={18} />
            </Button>
          </Flex>
        )}

        {isFileDragged ? (
          <Stack align="center" gap="xs">
            <Avatar radius="xl" size="lg">
              <FaPlusCircle />
            </Avatar>
            <Text>Drop your images here</Text>
          </Stack>
        ) : (
          <Button
            variant="light"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/jpeg,image/png,image/gif";
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from(
                  (e.target as HTMLInputElement).files || [],
                );
                handleFileUpload(files);
              };
              input.click();
            }}
            loading={isUploading}
            className={styles.uploadButton}
          >
            {introImages.length === 0 ? "Upload Images" : "Upload More Images"}
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export default ChatIntroImageManager;

import {
  Button,
  Modal,
  Stack,
  Text,
  Avatar,
  Center,
  Group,
  Card,
  CloseButton,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useState, useEffect, useRef } from "react";
import { useBusinessDocumentMutations } from "./useBusinessDocumentMutations";
import { FaPlusCircle, FaFile, FaUpload } from "react-icons/fa";
import styles from "./BusinessDocs.module.scss";

interface BusinessDocumentManagerProps {
  opened: boolean;
  onClose: () => void;
  initialStagedFiles?: File[];
}

const BusinessDocumentManager: React.FC<BusinessDocumentManagerProps> = ({
  opened,
  onClose,
  initialStagedFiles = [],
}) => {
  const [isFileDragged, setIsFileDragged] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const { processMutation } = useBusinessDocumentMutations();
  const hasSetInitialFiles = useRef(false);

  // Update staged files when modal opens with initial files
  useEffect(() => {
    if (
      opened &&
      initialStagedFiles.length > 0 &&
      !hasSetInitialFiles.current
    ) {
      setStagedFiles(initialStagedFiles);
      hasSetInitialFiles.current = true;
    } else if (!opened) {
      setStagedFiles([]);
      hasSetInitialFiles.current = false;
    }
  }, [opened, initialStagedFiles]);

  const handleFileStaging = (files: File[]) => {
    if (files.length === 0) return;

    // Filter for supported file types
    const supportedFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "pdf"].includes(extension || "");
    });

    setStagedFiles((prev) => [...prev, ...supportedFiles]);
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProcessFiles = async () => {
    if (stagedFiles.length === 0) return;

    const formData = new FormData();
    stagedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await processMutation.mutateAsync(formData);
      setStagedFiles([]); // Clear staged files after successful upload
      onClose(); // Close modal after successful processing
    } catch (error) {
      console.error("Process error:", error);
    }
  };

  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Manage Your Business Documents"
      size="xl"
      styles={{
        body: {
          padding: 0,
          maxHeight: "80vh",
          overflow: "auto",
        },
      }}
    >
      <Stack p="md">
        <Dropzone
          onDrop={(files) => handleFileStaging(files)}
          onDragEnter={() => setIsFileDragged(true)}
          onDragLeave={() => setIsFileDragged(false)}
          accept={acceptedFileTypes}
          multiple={true}
          activateOnClick={false}
          className={
            isFileDragged ? styles.dragOverlay : styles.managerDropzone
          }
        >
          <Center className={styles.emptyStateManager}>
            {stagedFiles.length === 0 ? (
              <Stack align="center" gap="xs">
                <FaFile size={24} color="#666" />
                <Text size="sm" c="dimmed">
                  No documents added yet
                </Text>
                <Text size="sm" c="dimmed">
                  Drag and drop documents here or click the button below
                </Text>
                <Text size="xs" c="dimmed">
                  Supported: Images (JPG, PNG, GIF), PDFs
                </Text>
              </Stack>
            ) : (
              <Stack align="center" gap="xs">
                <FaFile size={24} color="#666" />
                <Text size="sm" c="dimmed">
                  Drop more files here or use the button below
                </Text>
              </Stack>
            )}
          </Center>
        </Dropzone>

        {/* Staged Files Section */}
        {stagedFiles.length > 0 && (
          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Staged Files ({stagedFiles.length})
            </Text>
            {stagedFiles.map((file, index) => (
              <Card key={index} padding="xs" withBorder>
                <Group justify="space-between">
                  <Group gap="sm">
                    <FaFile size={16} />
                    <Text size="sm">{file.name}</Text>
                    <Text size="xs" c="dimmed">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </Text>
                  </Group>
                  <CloseButton
                    size="sm"
                    onClick={() => removeStagedFile(index)}
                  />
                </Group>
              </Card>
            ))}
            <Button
              variant="filled"
              onClick={handleProcessFiles}
              loading={processMutation.isLoading}
              leftSection={<FaUpload size={16} />}
            >
              Process Files ({stagedFiles.length})
            </Button>
          </Stack>
        )}

        {isFileDragged ? (
          <Stack align="center" gap="xs">
            <Avatar radius="xl" size="lg">
              <FaPlusCircle />
            </Avatar>
            <Text>Drop your documents here</Text>
          </Stack>
        ) : (
          <Button
            variant="light"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = acceptedFileTypes.join(",");
              input.multiple = true;
              input.onchange = (e) => {
                const files = Array.from(
                  (e.target as HTMLInputElement).files || [],
                );
                handleFileStaging(files);
              };
              input.click();
            }}
            className={styles.uploadButton}
          >
            {stagedFiles.length > 0 ? "Add More Files" : "Upload Documents"}
          </Button>
        )}
      </Stack>
    </Modal>
  );
};

export default BusinessDocumentManager;

import {
  Box,
  Text,
  Center,
  Stack,
  Group,
  Loader,
  ActionIcon,
  Collapse,
} from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { useState, useRef } from "react";
import {
  FaFile,
  FaPlus,
  FaAngleDoubleUp,
  FaAngleDoubleDown,
} from "react-icons/fa";
import { BusinessDocumentResponse } from "../../../api/requests_responses/business";
import BusinessDocumentManager from "./BusinessDocumentManager";
import styles from "./BusinessDocs.module.scss";
import DocumentList from "../../../utils/components/DocumentList";
import { MoonLoader } from "react-spinners";

interface BusinessDocsProps {
  documents: BusinessDocumentResponse[];
  isLoading: boolean;
  isPastProcessing: boolean;
}

const BusinessDocs = ({
  documents,
  isLoading,
  isPastProcessing,
}: BusinessDocsProps) => {
  const [managerOpened, setManagerOpened] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [initialStagedFiles, setInitialStagedFiles] = useState<File[]>([]);
  const [dropState, setDropState] = useState<"idle" | "accept" | "reject">(
    "idle",
  );
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileDrop = (files: File[]) => {
    // Clear any existing timeout
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current);
    }

    // Filter for supported file types
    const supportedFiles = files.filter((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();
      return ["jpg", "jpeg", "png", "gif", "pdf"].includes(extension || "");
    });

    if (supportedFiles.length > 0) {
      setInitialStagedFiles(supportedFiles);
      setManagerOpened(true);
    }

    // Reset drop state after 1 second
    dropTimeoutRef.current = setTimeout(() => {
      setDropState("idle");
      dropTimeoutRef.current = null;
    }, 1000);
  };

  const handleManagerClose = () => {
    setManagerOpened(false);
    setInitialStagedFiles([]); // Clear initial staged files when closing
  };

  const acceptedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  if (isLoading) {
    return (
      <Center style={{ height: 400 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Dropzone
      onDrop={handleFileDrop}
      onDragEnter={(event) => {
        const items = Array.from(event.dataTransfer.items);
        const hasValidFiles = items.some((item) => {
          if (item.kind === "file") {
            const extension = item.type.split("/")[1] || "";
            return (
              acceptedFileTypes.includes(item.type) ||
              ["jpg", "jpeg", "png", "gif"].includes(extension)
            );
          }
          return false;
        });
        setDropState(hasValidFiles ? "accept" : "reject");
      }}
      onDragLeave={() => setDropState("idle")}
      accept={acceptedFileTypes}
      multiple={true}
      activateOnClick={false}
      styles={{
        root: {
          border: "none",
          backgroundColor: "transparent",
          padding: 0,
          pointerEvents: "none",
        },
        inner: {
          pointerEvents: "auto",
        },
      }}
    >
      <Box
        className={styles.businessDocs}
        data-accept={dropState === "accept" || undefined}
        data-reject={dropState === "reject" || undefined}
        data-idle={dropState === "idle" || undefined}
      >
        <Group justify="space-between" mb={isCollapsed ? 0 : "md"}>
          <Text size="lg" fw={600}>
            Your Business Documents
          </Text>
          <Group gap="sm">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={styles.collapseButton}
            >
              {isCollapsed ? (
                <FaAngleDoubleDown size={18} />
              ) : (
                <FaAngleDoubleUp size={18} />
              )}
            </ActionIcon>
            {isPastProcessing ? (
              <Group gap="xs" align="center">
                <MoonLoader size={15} />
                <Text size="sm" c="dimmed">
                  Learning about your business...
                </Text>
              </Group>
            ) : (
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => setManagerOpened(true)}
              >
                <FaPlus size={18} />
              </ActionIcon>
            )}
          </Group>
        </Group>

        <Collapse in={!isCollapsed}>
          {documents && documents.length > 0 ? (
            <DocumentList
              documents={documents}
              onPreview={(document) => {
                window.open(document.file_s3_url, "_blank");
              }}
            />
          ) : (
            <Center
              className={styles.emptyState}
              onClick={() => setManagerOpened(true)}
            >
              <Stack align="center" gap="xs">
                <FaFile size={48} color="#666" />
                <Text size="lg" c="dimmed">
                  No documents uploaded yet
                </Text>
                <Text size="sm" c="dimmed">
                  Click here or drop files to add your first document
                </Text>
                <Text size="xs" c="dimmed">
                  Supported: Images (JPG, PNG, GIF), PDFs
                </Text>
              </Stack>
            </Center>
          )}
        </Collapse>

        <BusinessDocumentManager
          opened={managerOpened}
          onClose={handleManagerClose}
          initialStagedFiles={initialStagedFiles}
        />
      </Box>
    </Dropzone>
  );
};

export default BusinessDocs;

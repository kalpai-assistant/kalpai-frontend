import React from "react";
import { Stack, Group, Text, ActionIcon, Paper, Box } from "@mantine/core";
import {
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileAlt,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import { BusinessDocumentResponse } from "../../api/requests_responses/business";
import styles from "./Document.module.scss";

interface DocumentListProps {
  documents: BusinessDocumentResponse[];
  onPreview?: (document: BusinessDocumentResponse) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
}) => {
  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return <FaFilePdf color="#dc3545" />;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || ""))
      return <FaFileImage color="#28a745" />;
    if (["doc", "docx"].includes(extension || ""))
      return <FaFileWord color="#007bff" />;
    return <FaFileAlt color="#6c757d" />;
  };

  return (
    <Stack gap="xs" className={styles.documentList}>
      {documents.map((document) => (
        <Paper key={document.id} p="sm" withBorder>
          <Group justify="space-between">
            <Group gap="sm">
              <Box className={styles.documentIcon}>
                {getFileIcon(document.file_s3_url)}
              </Box>
              <Box>
                <Text size="sm" fw={500}>
                  {document.file_s3_url.split("/").pop() || "Document"}
                </Text>
                <Text size="xs" c="dimmed">
                  {new Date(document.created_time).toLocaleDateString()}
                </Text>
              </Box>
            </Group>

            <Group gap="xs">
              {onPreview && (
                <ActionIcon
                  variant="light"
                  size="sm"
                  onClick={() => onPreview(document)}
                >
                  <FaEye size={14} />
                </ActionIcon>
              )}
              <ActionIcon
                variant="light"
                size="sm"
                component="a"
                href={document.file_s3_url}
                download
                target="_blank"
              >
                <FaDownload size={14} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
};

export default DocumentList;

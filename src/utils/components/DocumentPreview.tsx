import React from "react";
import { Box, Image, Text, Center, Stack } from "@mantine/core";
import { FaFile } from "react-icons/fa";
import styles from "./Document.module.scss";

interface DocumentPreviewProps {
  fileUrl: string;
  height?: number;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  fileUrl,
  height = 350,
}) => {
  // Extract filename from URL
  const fileName = fileUrl.split("/").pop() || "document";

  // Determine file type from URL/extension
  const getFileType = (url: string) => {
    const extension = url.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return "image";
    }
    if (extension === "pdf") {
      return "pdf";
    }
    return "other";
  };

  const fileType = getFileType(fileUrl);

  if (fileType === "image") {
    return (
      <Image
        src={fileUrl}
        alt={fileName}
        height={height}
        fit="contain"
        className={styles.imagePreview}
      />
    );
  }

  if (fileType === "pdf") {
    return (
      <Box className={styles.pdfContainer} style={{ height: height }}>
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          width="100%"
          height="100%"
          className={styles.pdfIframe}
          title={fileName}
        />
      </Box>
    );
  }

  // Fallback for other file types
  return (
    <Center className={styles.fallbackContainer} style={{ height: height }}>
      <Stack align="center" gap="md">
        <FaFile size={48} color="#6c757d" />
        <Text size="sm" c="dimmed" ta="center">
          {fileName}
        </Text>
        <Text size="xs" c="dimmed" ta="center">
          Click to download
        </Text>
      </Stack>
    </Center>
  );
};

export default DocumentPreview;

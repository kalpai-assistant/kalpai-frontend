import React, { useState, useEffect } from "react";
import {
  Stack,
  Group,
  Button,
  Text,
  Card,
  Image,
  ActionIcon,
  Alert,
  Badge,
  FileButton,
} from "@mantine/core";
import {
  IconUpload,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

interface ImageMapping {
  placeholder: string; // e.g., "IMAGE_1"
  file?: File;
  fileId?: number; // For existing files
  s3Url?: string; // For existing files
  previewUrl?: string; // Local preview URL
}

interface ImageUploadManagerProps {
  template: string;
  existingMappings?: Array<{
    placeholder_key: string;
    file_id: number;
    s3_url: string;
  }>;
  imageMappings: ImageMapping[]; // Receive current mappings from parent
  onChange: (mappings: ImageMapping[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  template,
  existingMappings = [],
  imageMappings: parentImageMappings,
  onChange,
}) => {
  const [error, setError] = useState<string>("");

  // Extract placeholders from template
  const extractPlaceholders = (text: string): string[] => {
    const regex = /\{\{IMAGE_(\d+)\}\}/g;
    const matches: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(`IMAGE_${match[1]}`);
    }

    return Array.from(new Set(matches)).sort(); // Remove duplicates and sort
  };

  // Sync with template placeholders
  useEffect(() => {
    const placeholders = extractPlaceholders(template);

    const syncedMappings: ImageMapping[] = placeholders.map((placeholder) => {
      // Check if parent already has this mapping (from drag-drop or previous state)
      const parentMapping = parentImageMappings.find(
        (m) => m.placeholder === placeholder,
      );

      if (parentMapping) {
        return parentMapping;
      }

      // Check if we have existing mapping from server
      const existing = existingMappings.find(
        (m) => m.placeholder_key === placeholder,
      );

      if (existing) {
        return {
          placeholder,
          fileId: existing.file_id,
          s3Url: existing.s3_url,
          previewUrl: existing.s3_url,
        };
      }

      // New placeholder without file
      return {
        placeholder,
      };
    });

    // IMPORTANT: Preserve mappings that exist in parent but not in template
    // (user might be cutting/pasting, don't lose the file!)
    const preservedMappings = parentImageMappings.filter((parentMap) => {
      // Keep if it has a file/fileId and isn't in current template
      return (
        (parentMap.file || parentMap.fileId) &&
        !placeholders.includes(parentMap.placeholder)
      );
    });

    // Merge: current template placeholders + preserved old mappings
    const finalMappings = [...syncedMappings, ...preservedMappings];

    onChange(finalMappings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, existingMappings]);

  const handleFileSelect = (placeholder: string, file: File | null) => {
    if (!file) return;

    setError("");

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit.");
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    const updatedMappings = parentImageMappings.map((mapping) =>
      mapping.placeholder === placeholder
        ? {
            ...mapping,
            file,
            previewUrl,
            fileId: undefined,
            s3Url: undefined,
          }
        : mapping,
    );

    onChange(updatedMappings);
  };

  const handleRemoveImage = (placeholder: string) => {
    const updatedMappings = parentImageMappings.map((mapping) => {
      if (mapping.placeholder === placeholder) {
        // Revoke preview URL if it exists
        if (mapping.previewUrl && mapping.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(mapping.previewUrl);
        }
        return {
          placeholder,
        };
      }
      return mapping;
    });

    onChange(updatedMappings);
  };

  const placeholdersInTemplate = extractPlaceholders(template);

  // Split mappings into active (in template) and unused (preserved files)
  const activeMappings = parentImageMappings.filter((m) =>
    placeholdersInTemplate.includes(m.placeholder),
  );
  const unusedMappings = parentImageMappings.filter(
    (m) =>
      !placeholdersInTemplate.includes(m.placeholder) && (m.file || m.fileId),
  );

  if (activeMappings.length === 0 && unusedMappings.length === 0) {
    return null; // Don't show anything if no placeholders and no preserved images
  }

  return (
    <Stack gap="md">
      {activeMappings.length > 0 && (
        <>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Email Images
            </Text>
            <Badge
              color={
                activeMappings.every((m) => m.file || m.s3Url)
                  ? "green"
                  : "yellow"
              }
            >
              {activeMappings.filter((m) => m.file || m.s3Url).length} /{" "}
              {activeMappings.length} ready
            </Badge>
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              withCloseButton
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <Stack gap="sm">
            {activeMappings.map((mapping) => (
              <Card key={mapping.placeholder} padding="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text
                      size="sm"
                      fw={500}
                      style={{ fontFamily: "monospace" }}
                    >
                      {`{{${mapping.placeholder}}}`}
                    </Text>
                    {(mapping.file || mapping.s3Url) && (
                      <Badge
                        color="green"
                        leftSection={<IconCheck size={12} />}
                      >
                        Ready
                      </Badge>
                    )}
                  </Group>

                  {mapping.previewUrl ? (
                    <Group gap="md">
                      <Image
                        src={mapping.previewUrl}
                        alt={mapping.placeholder}
                        width={120}
                        height={120}
                        fit="cover"
                        radius="md"
                      />
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {mapping.file
                            ? `${mapping.file.name} (${(
                                mapping.file.size / 1024
                              ).toFixed(1)} KB)`
                            : "Existing image"}
                        </Text>
                        <Group gap="xs">
                          <FileButton
                            onChange={(file) =>
                              handleFileSelect(mapping.placeholder, file)
                            }
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          >
                            {(props) => (
                              <Button {...props} size="xs" variant="light">
                                Replace
                              </Button>
                            )}
                          </FileButton>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() =>
                              handleRemoveImage(mapping.placeholder)
                            }
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Stack>
                    </Group>
                  ) : (
                    <FileButton
                      onChange={(file) =>
                        handleFileSelect(mapping.placeholder, file)
                      }
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    >
                      {(props) => (
                        <Button
                          {...props}
                          leftSection={<IconUpload size={16} />}
                          variant="light"
                          fullWidth
                        >
                          Select Image
                        </Button>
                      )}
                    </FileButton>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </>
      )}

      {unusedMappings.length > 0 && (
        <>
          <Group justify="space-between" mt="md">
            <Text size="sm" fw={500} c="dimmed">
              Uploaded Images (Not in Template)
            </Text>
            <Badge color="gray">{unusedMappings.length} preserved</Badge>
          </Group>
          <Alert
            color="blue"
            variant="light"
            icon={<IconInfoCircle size={16} />}
          >
            <Text size="xs">
              These images were uploaded but their placeholders are not in the
              template. Paste them back (e.g.,{" "}
              <Text
                span
                fw={700}
                style={{ fontFamily: "monospace" }}
              >{`{{${unusedMappings[0].placeholder}}}`}</Text>
              ) or remove them.
            </Text>
          </Alert>
          <Stack gap="sm">
            {unusedMappings.map((mapping) => (
              <Card
                key={mapping.placeholder}
                padding="md"
                withBorder
                style={{ opacity: 0.7 }}
              >
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text
                      size="sm"
                      fw={500}
                      style={{ fontFamily: "monospace" }}
                      c="dimmed"
                    >
                      {`{{${mapping.placeholder}}}`}
                    </Text>
                    <Badge color="gray">Not in template</Badge>
                  </Group>

                  {mapping.previewUrl && (
                    <Group gap="md">
                      <Image
                        src={mapping.previewUrl}
                        alt={mapping.placeholder}
                        width={120}
                        height={120}
                        fit="cover"
                        radius="md"
                      />
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Text size="xs" c="dimmed">
                          {mapping.file
                            ? `${mapping.file.name} (${(
                                mapping.file.size / 1024
                              ).toFixed(1)} KB)`
                            : "Existing image"}
                        </Text>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleRemoveImage(mapping.placeholder)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Stack>
                    </Group>
                  )}
                </Stack>
              </Card>
            ))}
          </Stack>
        </>
      )}

      <Alert
        color="blue"
        variant="light"
        icon={<IconInfoCircle size={16} />}
        title="Supported formats and max size"
      >
        <Group gap="xs">
          <Text size="xs">Supported formats: JPG, PNG, GIF, WEBP</Text>
          <Text size="xs">Max size: 5MB per image</Text>
        </Group>
      </Alert>
    </Stack>
  );
};

export default ImageUploadManager;

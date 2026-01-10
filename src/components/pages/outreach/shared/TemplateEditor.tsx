import React, { useRef, useState } from "react";
import {
  Textarea,
  Text,
  Button,
  Group,
  Paper,
  Stack,
  Box,
} from "@mantine/core";
import { IconVariable, IconPhoto } from "@tabler/icons-react";

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  variables?: string[];
  showCharacterCount?: boolean;
  maxLength?: number;
  onImageDrop?: (file: File, placeholder: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter your template...",
  label = "Template",
  variables = ["name", "company_name", "location"],
  showCharacterCount = false,
  maxLength,
  onImageDrop,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const insertVariable = (variable: string) => {
    const template = `{{${variable}}}`;
    const newValue = value + template;
    onChange(newValue);
  };

  const getNextImageId = (): string => {
    // Find existing image placeholders in template
    const matches = value.match(/\{\{IMAGE_(\d+)\}\}/g) || [];
    const existingIds = matches.map((m) => {
      const match = m.match(/IMAGE_(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });

    // Get next available ID
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `IMAGE_${maxId + 1}`;
  };

  const insertImagePlaceholder = (
    placeholder: string,
    cursorPosition?: number,
  ) => {
    const placeholderText = `{{${placeholder}}}`;

    if (cursorPosition !== undefined && textareaRef.current) {
      // Insert at cursor position
      const before = value.substring(0, cursorPosition);
      const after = value.substring(cursorPosition);
      onChange(before + placeholderText + "\n" + after);
    } else {
      // Insert at end
      onChange(value + (value ? "\n" : "") + placeholderText + "\n");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      return;
    }

    // Get cursor position at drop (approximate - we'll insert at end for simplicity)
    const textarea = textareaRef.current;
    const cursorPosition = textarea?.selectionStart;

    // Process each image
    imageFiles.forEach((file, index) => {
      const placeholder = getNextImageId();

      // Insert placeholder at cursor or end
      insertImagePlaceholder(placeholder, cursorPosition);

      // Notify parent about the dropped file
      if (onImageDrop) {
        onImageDrop(file, placeholder);
      }
    });
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {showCharacterCount && maxLength && (
          <Text size="xs" c="dimmed">
            {value.length} / {maxLength}
          </Text>
        )}
      </Group>

      <Box
        pos="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          minRows={12}
          maxRows={30}
          autosize
          maxLength={maxLength}
          styles={{
            input: {
              fontFamily: "monospace",
              fontSize: "14px",
            },
          }}
        />

        {isDragging && (
          <Box
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            style={{
              backgroundColor: "rgba(64, 192, 255, 0.1)",
              border: "2px dashed #40c0ff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            <Paper p="xl" shadow="sm" style={{ backgroundColor: "white" }}>
              <Stack align="center" gap="sm">
                <IconPhoto size={48} color="#40c0ff" />
                <Text size="lg" fw={600} c="blue">
                  Drop image here
                </Text>
                <Text size="sm" c="dimmed">
                  Placeholder will be inserted automatically
                </Text>
              </Stack>
            </Paper>
          </Box>
        )}
      </Box>

      <Paper p="xs" withBorder>
        <Group gap="xs" align="center">
          <IconVariable size={16} />
          <Text size="xs" c="dimmed">
            Insert variables:
          </Text>
          {variables.map((variable) => (
            <Button
              key={variable}
              size="xs"
              variant="light"
              onClick={() => insertVariable(variable)}
            >
              {`{{${variable}}}`}
            </Button>
          ))}
        </Group>
      </Paper>

      <Text size="xs" c="dimmed">
        💡 Drag and drop images directly into the template to insert them
        automatically
      </Text>
    </Stack>
  );
};

export default TemplateEditor;

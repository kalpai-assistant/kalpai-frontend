import React, { useEffect, useState, useMemo } from "react";
import {
  Stack,
  Select,
  Text,
  Badge,
  Alert,
  Card,
  Group,
  Divider,
  Table,
  ScrollArea,
  Box,
  Accordion,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconTable,
  IconSparkles,
} from "@tabler/icons-react";
import {
  ColumnMapping,
  SYSTEM_FIELDS,
  FilePreview,
} from "../../../../../types/emailList";
import { autoDetectColumnsWithSemantics } from "../../../../../utils/columnMatcher";

/**
 * ColumnMapper Component
 * Provides intelligent column mapping UI with dropdown-based field selection
 * Follows Single Responsibility Principle - handles only column mapping UI
 */

interface ColumnMapperProps {
  filePreview: FilePreview;
  onMappingChange: (mapping: ColumnMapping, isValid: boolean) => void;
  initialMapping?: ColumnMapping;
}

const ColumnMapper: React.FC<ColumnMapperProps> = ({
  filePreview,
  onMappingChange,
  initialMapping = {},
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  // Auto-detect columns on mount using semantic matching
  useEffect(() => {
    const autoMapping = autoDetectColumnsWithSemantics(
      filePreview.columns,
      SYSTEM_FIELDS,
      0.5, // Minimum 50% confidence for auto-mapping
    );
    setMapping(autoMapping);
  }, [filePreview.columns]);

  // Notify parent of mapping changes
  useEffect(() => {
    const { isValid } = validateMapping(mapping);
    onMappingChange(mapping, isValid);
  }, [mapping, onMappingChange]);

  const handleFieldChange = (
    systemField: string,
    fileColumn: string | null,
  ) => {
    setMapping((prev) => ({
      ...prev,
      [systemField]: fileColumn,
    }));
  };

  const { isValid, missingFields } = validateMapping(mapping);

  // Get available columns for dropdown (exclude already mapped columns)
  const getAvailableColumns = (currentSystemField: string): string[] => {
    const mappedColumns = new Set(
      Object.entries(mapping)
        .filter(([key, value]) => key !== currentSystemField && value !== null)
        .map(([_, value]) => value as string),
    );

    return filePreview.columns.filter((col) => !mappedColumns.has(col));
  };

  // Get unmapped columns (columns in file that aren't mapped to any system field)
  const unmappedColumns = useMemo(() => {
    const mappedCols = new Set(Object.values(mapping).filter(Boolean));
    return filePreview.columns.filter((col) => !mappedCols.has(col));
  }, [filePreview.columns, mapping]);

  return (
    <Stack gap="md">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <IconTable size={20} />
              <Text fw={600} size="sm">
                Map Your Columns
              </Text>
              <Tooltip label="Using AI-powered semantic matching">
                <Badge
                  size="xs"
                  variant="light"
                  color="violet"
                  leftSection={<IconSparkles size={12} />}
                >
                  Smart Detection
                </Badge>
              </Tooltip>
            </Group>
            <Badge
              color={isValid ? "green" : "orange"}
              variant="light"
              leftSection={
                isValid ? (
                  <IconCheck size={14} />
                ) : (
                  <IconAlertCircle size={14} />
                )
              }
            >
              {isValid ? "Ready" : `${missingFields.length} Required`}
            </Badge>
          </Group>

          <Text size="xs" c="dimmed">
            Columns are auto-mapped using intelligent semantic matching. Review
            and adjust as needed.
          </Text>

          {!isValid && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="orange"
              variant="light"
            >
              Missing required fields: {missingFields.join(", ")}
            </Alert>
          )}

          <Divider />

          {/* Column Mapping Grid */}
          <Stack gap="sm">
            {SYSTEM_FIELDS.map((field) => {
              const availableColumns = getAvailableColumns(field.key);
              const currentValue = mapping[field.key] || null;

              // Add current value to available options if it exists
              const selectOptions = [
                { value: "", label: "-- Skip this field --" },
                ...(currentValue && !availableColumns.includes(currentValue)
                  ? [{ value: currentValue, label: currentValue }]
                  : []),
                ...availableColumns.map((col) => ({ value: col, label: col })),
              ];

              const isMapped = currentValue !== null && currentValue !== "";
              const isMissingRequired = field.required && !isMapped;

              return (
                <Card
                  key={field.key}
                  padding="sm"
                  radius="sm"
                  withBorder
                  style={{
                    borderColor: isMissingRequired
                      ? "var(--mantine-color-orange-6)"
                      : isMapped
                      ? "var(--mantine-color-green-6)"
                      : undefined,
                    borderWidth: isMissingRequired || isMapped ? 2 : 1,
                  }}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <Box style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Text size="sm" fw={500}>
                          {field.label}
                        </Text>
                        {field.required && (
                          <Badge size="xs" color="red" variant="light">
                            Required
                          </Badge>
                        )}
                        <Tooltip
                          label={field.description}
                          position="top"
                          withArrow
                        >
                          <Box
                            component="span"
                            style={{ cursor: "help", lineHeight: 0 }}
                          >
                            <IconInfoCircle size={14} color="gray" />
                          </Box>
                        </Tooltip>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {field.description}
                      </Text>
                    </Box>

                    <Select
                      placeholder="Select column"
                      data={selectOptions}
                      value={currentValue || ""}
                      onChange={(value) =>
                        handleFieldChange(field.key, value || null)
                      }
                      clearable
                      searchable
                      style={{ minWidth: 200 }}
                      size="sm"
                      error={isMissingRequired}
                    />
                  </Group>
                </Card>
              );
            })}
          </Stack>

          {/* Unmapped Columns Alert */}
          {unmappedColumns.length > 0 && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
            >
              <Text size="sm" fw={500} mb={4}>
                Unmapped Columns ({unmappedColumns.length})
              </Text>
              <Text size="xs" c="dimmed">
                These columns will be stored as custom fields:{" "}
                {unmappedColumns.join(", ")}
              </Text>
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Data Preview */}
      <Accordion variant="separated" defaultValue="preview">
        <Accordion.Item value="preview">
          <Accordion.Control icon={<IconTable size={18} />}>
            <Text size="sm" fw={500}>
              Data Preview ({filePreview.totalRows} total rows)
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <ScrollArea>
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    {filePreview.columns.map((col) => (
                      <Table.Th key={col}>
                        <Text size="xs" fw={600}>
                          {col}
                        </Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filePreview.sampleRows.map((row, idx) => (
                    <Table.Tr key={idx}>
                      {filePreview.columns.map((col) => (
                        <Table.Td key={col}>
                          <Text
                            size="xs"
                            lineClamp={1}
                            style={{ maxWidth: 200 }}
                          >
                            {row[col] || "-"}
                          </Text>
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
};

// Semantic column detection is now handled by autoDetectColumnsWithSemantics
// from columnMatcher.ts utility

/**
 * Validate column mapping
 */
const validateMapping = (
  mapping: ColumnMapping,
): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (!mapping[field.key] || mapping[field.key] === "") {
      missingFields.push(field.label);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

export default ColumnMapper;

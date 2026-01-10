import React, { useState } from "react";
import { Group, Box, TextInput, ActionIcon, Collapse } from "@mantine/core";
import { makeStringHumanReadable } from "../../../utils/utils";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

interface FieldRendererProps {
  keyName: string;
  value: any;
  form: any;
  path: string[];
  idx?: number;
}

const BusinessFieldRenderer: React.FC<FieldRendererProps> = ({
  keyName,
  value,
  form,
  path,
  idx = -1,
}) => {
  const fieldPath = [...path, idx === -1 ? keyName : idx].join(".");
  const [expanded, setExpanded] = useState(true);

  if (typeof value === "string") {
    return (
      <Group key={fieldPath} mt="sm">
        <TextInput
          value={makeStringHumanReadable(keyName)}
          readOnly
          styles={{ input: { fontWeight: "bold" } }}
        />
        <TextInput {...form.getInputProps(fieldPath)} value={value} />
      </Group>
    );
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return (
      <div>
        <ActionIcon onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </ActionIcon>
        <Box key={fieldPath}>
          {keyName && (
            <TextInput
              value={makeStringHumanReadable(keyName)}
              readOnly
              styles={{ input: { fontWeight: "bold" } }}
            />
          )}
          <Collapse in={expanded}>
            <Box pl="lg">
              {Object.entries(value).map(([k, v]) => (
                <BusinessFieldRenderer
                  key={k}
                  keyName={k}
                  value={v}
                  form={form}
                  path={[...path, keyName]}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      </div>
    );
  }

  if (Array.isArray(value)) {
    return (
      <Box key={fieldPath} mt="sm">
        {keyName && (
          <TextInput
            value={makeStringHumanReadable(keyName)}
            readOnly
            styles={{ input: { fontWeight: "bold" } }}
          />
        )}
        <Group key={`${fieldPath}-group`} mt="sm" align="flex-start">
          {value.map((item, index) =>
            typeof item === "object" ? (
              <BusinessFieldRenderer
                key={index}
                keyName=""
                value={item}
                form={form}
                path={[...path, keyName]}
                idx={index}
              />
            ) : (
              <TextInput
                key={`${fieldPath}.${index}`}
                {...form.getInputProps(`${fieldPath}.${index}`)}
              />
            ),
          )}
        </Group>
      </Box>
    );
  }

  return null;
};

export default BusinessFieldRenderer;

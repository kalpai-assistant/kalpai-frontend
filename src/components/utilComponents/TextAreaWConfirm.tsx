import { useEffect, useState } from "react";
import { Textarea, ActionIcon, Flex } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

interface TextAreaWithConfirmProps {
  value?: string;
  label?: string;
  handleChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeHolder?: string;
}

const TextAreaWithConfirm = ({
  value = "",
  label = undefined,
  handleChange,
  onSubmit,
  onCancel,
  placeHolder = "Type something...",
}: TextAreaWithConfirmProps) => {
  const [isEditing, setIsEditing] = useState(true);
  const [initialValue, setInitialValue] = useState(value);

  useEffect(() => {
    setInitialValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit();
    setIsEditing(false);
  };

  const handleCancel = () => {
    onCancel && onCancel();
    handleChange(initialValue);
    setIsEditing(false);
  };

  return (
    <Flex w="100%">
      <Textarea
        value={value}
        label={label}
        onChange={handleInputChange}
        placeholder={placeHolder}
        onFocus={() => setIsEditing(true)}
        autosize
        minRows={3}
        maxRows={6}
        style={{ flex: 1 }}
      />

      {/* Icons container (Only show when editing) */}
      {isEditing && (
        <Flex direction="column" justify="flex-start">
          <ActionIcon
            color="green"
            size="lg"
            variant="light"
            onClick={handleSubmit}
          >
            <IconCheck size={16} />
          </ActionIcon>

          <ActionIcon
            color="red"
            size="lg"
            variant="light"
            onClick={handleCancel}
          >
            <IconX size={16} />
          </ActionIcon>
        </Flex>
      )}
    </Flex>
  );
};

export default TextAreaWithConfirm;

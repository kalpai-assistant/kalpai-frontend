import { useEffect, useState } from "react";
import { TextInput, Box, ActionIcon } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

interface TextInputWConfirmProps {
  value?: string;
  label?: string;
  handleChange: (value: string) => void;
  onSubmit: () => void;
}

const TextInputWConfirm = ({
  value = "",
  label = undefined,
  handleChange,
  onSubmit,
}: TextInputWConfirmProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [initialValue, setInitialValue] = useState("");

  useEffect(() => {
    setInitialValue(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.value);
  };

  const handleSubmit = () => {
    onSubmit();
    setIsEditing(false);
  };

  const handleCancel = () => {
    handleChange(initialValue);
    setIsEditing(false);
  };

  return (
    <Box display="flex">
      <TextInput
        value={value}
        label={label}
        onChange={handleInputChange}
        placeholder="Type something..."
        onFocus={() => setIsEditing(true)}
        style={{ flex: 1 }}
      />

      {/* Icons container */}
      {isEditing && (
        <Box>
          {/* Tick Icon */}
          <ActionIcon
            color="green"
            size="lg"
            variant="light"
            onClick={handleSubmit}
          >
            <IconCheck size={16} />
          </ActionIcon>

          {/* Cross Icon */}
          <ActionIcon
            color="red"
            size="lg"
            variant="light"
            onClick={handleCancel}
          >
            <IconX size={16} />
          </ActionIcon>
        </Box>
      )}
    </Box>
  );
};

export default TextInputWConfirm;

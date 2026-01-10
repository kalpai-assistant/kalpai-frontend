import { ActionIcon, Button, Flex, Text, Title } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { ButtonColors } from "../../../utils/constants";

interface RefetchButtonProps {
  isLoading: boolean;
  refetch: () => void;
}

export const RefetchButton: React.FC<RefetchButtonProps> = ({
  isLoading,
  refetch,
}) => (
  <Flex w="100%" justify="flex-end" align="center" mt="-2rem">
    <ActionIcon
      onClick={() => refetch()}
      loading={isLoading}
      size="lg"
      variant="transparent"
    >
      <IconRefresh size={20} color="gray" />
    </ActionIcon>
  </Flex>
);

interface EmptyErrorStateProps {
  fullScreen?: boolean;
  navigateTo: string;
  titleText?: string;
  subText?: string;
  buttonText: string;
  color: ButtonColors;
}

export const EmptyErrorState: React.FC<EmptyErrorStateProps> = ({
  fullScreen = false,
  navigateTo,
  titleText,
  subText,
  buttonText,
  color,
}) => {
  const navigate = useNavigate();
  return (
    <Flex
      w="100%"
      h={fullScreen ? "100vh" : "100%"}
      justify="center"
      align="center"
      direction="column"
      gap="md"
    >
      {titleText && <Title c={color}>{titleText}</Title>}
      {subText && <Text>{subText}</Text>}
      <Button
        variant="outline"
        color={color}
        onClick={() => navigate(navigateTo)}
      >
        {buttonText}
      </Button>
    </Flex>
  );
};

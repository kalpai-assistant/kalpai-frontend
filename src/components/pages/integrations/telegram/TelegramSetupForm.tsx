import React, { useState } from "react";
import {
  Text,
  TextInput,
  Button,
  Flex,
  Alert,
  Collapse,
  List,
  ThemeIcon,
  Group,
  Loader,
  Paper,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "react-query";
import {
  IconRobot,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { createTelegramBotConfig } from "../../../../api/telegram";
import styles from "./TelegramSetupForm.module.scss";

interface TelegramSetupFormProps {
  onSetupComplete: () => void;
  showTitle?: boolean;
}

const TelegramSetupForm: React.FC<TelegramSetupFormProps> = ({
  onSetupComplete,
  showTitle = true,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm({
    initialValues: {
      bot_token: "",
    },
    validate: {
      bot_token: (value) => {
        if (!value) return "Bot token is required";
        if (!value.includes(":")) return "Invalid bot token format";
        return null;
      },
    },
  });

  const setupMutation = useMutation(createTelegramBotConfig, {
    onSuccess: () => {
      setSuccessMessage("Telegram bot has been configured successfully!");
      setErrorMessage("");
      form.reset();
      setTimeout(() => {
        onSetupComplete();
        setSuccessMessage("");
      }, 2000);
    },
    onError: (error: any) => {
      setErrorMessage(
        error?.response?.data?.detail || "Failed to configure bot",
      );
      setSuccessMessage("");
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    setupMutation.mutate(values);
  };

  return (
    <Paper p="md" shadow="sm" withBorder>
      {showTitle && (
        <Flex align="center" gap="sm" mb="md">
          <IconRobot size="1.5rem" />
          <Title order={3}>Telegram Bot Integration Setup</Title>
        </Flex>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex direction="column" gap="md">
          {successMessage && (
            <Alert
              icon={<IconCheck size="1rem" />}
              title="Success!"
              color="green"
              variant="light"
            >
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert
              icon={<IconX size="1rem" />}
              title="Setup Failed"
              color="red"
              variant="light"
            >
              {errorMessage}
            </Alert>
          )}

          <Alert
            icon={<IconInfoCircle size="1rem" />}
            title="Quick Setup Guide"
            color="blue"
            variant="light"
            mb="md"
          >
            <Flex direction="column" gap="sm">
              <Text size="sm" c="dimmed">
                Create your business bot in 3 simple steps:
              </Text>

              <List spacing="xs" size="sm">
                <List.Item
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <Text size="xs" fw={600}>
                        1
                      </Text>
                    </ThemeIcon>
                  }
                >
                  <Text size="sm" fw={500}>
                    Create bot with @BotFather
                  </Text>
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <Text size="xs" fw={600}>
                        2
                      </Text>
                    </ThemeIcon>
                  }
                >
                  <Text size="sm" fw={500}>
                    Get your bot token
                  </Text>
                </List.Item>
                <List.Item
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <Text size="xs" fw={600}>
                        3
                      </Text>
                    </ThemeIcon>
                  }
                >
                  <Text size="sm" fw={500}>
                    Enter bot token below
                  </Text>
                </List.Item>
              </List>

              <Button
                variant="subtle"
                leftSection={
                  showGuide ? <IconChevronUp /> : <IconChevronDown />
                }
                onClick={() => setShowGuide(!showGuide)}
                size="sm"
                mt="xs"
                className={styles.expandButton}
              >
                {showGuide
                  ? "Hide Detailed Instructions"
                  : "Show Detailed Instructions"}
              </Button>

              <Collapse
                in={showGuide}
                transitionDuration={300}
                transitionTimingFunction="ease-out"
              >
                <Flex
                  direction="column"
                  gap="md"
                  mt="sm"
                  className={showGuide ? styles.detailsContainer : undefined}
                >
                  <div className={showGuide ? styles.animatedStep : undefined}>
                    <Text size="sm" fw={600} c="blue">
                      Step 1: Open Telegram & find @BotFather
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • Search "@BotFather" in Telegram
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • Send: /newbot
                    </Text>
                  </div>

                  <div className={showGuide ? styles.animatedStep : undefined}>
                    <Text size="sm" fw={600} c="blue">
                      Step 2: Name your bot
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • Display name: "Your Business Bot"
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • Username: "yourbusiness_bot"
                    </Text>
                  </div>

                  <div className={showGuide ? styles.animatedStep : undefined}>
                    <Text size="sm" fw={600} c="blue">
                      Step 3: Copy the token
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • BotFather gives you a long token (e.g.,
                      1234567890:ABC...)
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • Copy and paste it in the Bot Token field below
                    </Text>
                    <Text size="xs" c="dimmed" ml="sm">
                      • That's it! We'll automatically configure everything else
                    </Text>
                  </div>
                </Flex>
              </Collapse>
            </Flex>
          </Alert>

          <TextInput
            label="Bot Token"
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            required
            {...form.getInputProps("bot_token")}
            type="password"
          />

          <Group justify="flex-end" mt="md">
            <Button
              type="submit"
              loading={setupMutation.isLoading}
              leftSection={
                setupMutation.isLoading ? <Loader size="xs" /> : undefined
              }
              size="md"
            >
              Activate Integration
            </Button>
          </Group>
        </Flex>
      </form>
    </Paper>
  );
};

export default TelegramSetupForm;

import { useState } from "react";
import { useQuery } from "react-query";
import { BusinessQueryNames } from "../../../../api/requests_responses/business";
import { businessChatIntegrationScript } from "../../../../api/business";
import {
  ActionIcon,
  CopyButton,
  Flex,
  List,
  Loader,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coy } from "react-syntax-highlighter/dist/esm/styles/prism";
import { IconCheck, IconCircleDashed, IconCopy } from "@tabler/icons-react";
import styles from "./BusinessDashboard.module.scss";
import { RefetchButton } from "../CommonUtils";

const BotIntegration: React.FC = () => {
  const [chatScript, setChatScript] = useState("");
  const { isLoading, refetch } = useQuery(
    BusinessQueryNames.CHAT_INTEGRATION_SCRIPT,
    () => businessChatIntegrationScript(),
    {
      onSuccess: (data) => {
        if (data.data.script) setChatScript(data.data.script);
      },
      refetchOnWindowFocus: false,
    },
  );
  return (
    <Flex direction="column" align="center" justify="center">
      <RefetchButton refetch={refetch} isLoading={isLoading} />
      {!isLoading && chatScript ? (
        <SyntaxHighlighter
          language="html"
          style={coy}
          customStyle={{
            fontSize: "12px", // Update font size here
            paddingBottom: "1rem", // Add custom padding if needed
            paddingRight: "1rem", // Add custom padding if needed
            borderRadius: "1rem", // Add custom border radius if needed
            backgroundColor: "#f5f5f5", // Add custom background color if needed
          }}
        >
          {chatScript}
        </SyntaxHighlighter>
      ) : (
        <Loader />
      )}
      <List
        spacing="xs"
        size="sm"
        center
        icon={
          <ThemeIcon color="gray" size={24} radius="xl">
            <IconCircleDashed size={16} />
          </ThemeIcon>
        }
        className={styles.scriptInstructions}
      >
        <List.Item>
          <Flex direction="row" align="center" justify="center" gap="sm">
            <Text size="sm">Copy the script </Text>
            <CopyButton value={chatScript} timeout={2000}>
              {({ copied, copy }) => (
                <ActionIcon
                  onClick={copy}
                  color={copied ? "teal" : "gray"}
                  variant="subtle"
                >
                  {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                </ActionIcon>
              )}
            </CopyButton>
          </Flex>
        </List.Item>
        <List.Item>
          <Flex direction="row" align="center" justify="center" gap="sm">
            <Text size="sm">Add the script to the </Text>
            <SyntaxHighlighter
              language="html"
              customStyle={{
                padding: "0.2rem",
                marginBlock: 0,
                backgroundColor: "white",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
              }}
            >
              {"<head> <yout script> </head>"}
            </SyntaxHighlighter>
          </Flex>
        </List.Item>
        <List.Item>
          <Text size="sm">This should go in the root of your frontend.</Text>
        </List.Item>
        <List.Item>
          <Text size="sm">Redeploy your frontend server</Text>
        </List.Item>
      </List>
    </Flex>
  );
};

export default BotIntegration;

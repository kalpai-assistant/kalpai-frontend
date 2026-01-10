import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Loader,
  Alert,
  Text,
  Button,
  Stack,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { gmailCallback } from "../../../../../api/outreach/email";

const GmailOAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // CRITICAL: Prevent React strict mode double-execution
  const hasCalledApi = useRef(false);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (hasCalledApi.current) {
      return;
    }

    // Handle OAuth error (user cancelled or error occurred)
    if (error) {
      hasCalledApi.current = true;
      setStatus("error");
      setErrorMessage("OAuth authorization was cancelled or failed");
      // Redirect immediately, clearing URL params
      setTimeout(() => {
        navigate("/outreach/email/accounts", { replace: true });
      }, 2000);
      return;
    }

    // No authorization code received
    if (!code) {
      hasCalledApi.current = true;
      setStatus("error");
      setErrorMessage("No authorization code received");
      // Redirect immediately
      setTimeout(() => {
        navigate("/outreach/email/accounts", { replace: true });
      }, 2000);
      return;
    }

    // Mark as called BEFORE making the API call
    hasCalledApi.current = true;

    // Call the backend with the authorization code
    const callBackend = async () => {
      try {
        await gmailCallback({ code, state: state || undefined });
        setStatus("success");
        // Redirect immediately after success, clearing URL params
        setTimeout(() => {
          navigate("/outreach/email/accounts", { replace: true });
        }, 1500);
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err?.response?.data?.detail || 
          "Failed to connect Gmail account. Authorization code may have been used already."
        );
        // Redirect immediately after error, clearing URL params
        setTimeout(() => {
          navigate("/outreach/email/accounts", { replace: true });
        }, 3000);
      }
    };

    callBackend();
    
    // IMPORTANT: Empty dependency array - run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" shadow="sm" withBorder>
        {status === "loading" && (
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text size="lg" fw={500}>
              Connecting your Gmail account...
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Please wait while we set up your account
            </Text>
          </Stack>
        )}

        {status === "success" && (
          <Stack align="center" gap="md">
            <IconCheck size={48} color="green" />
            <Text size="lg" fw={500} c="green">
              Gmail account connected successfully!
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Redirecting to accounts page...
            </Text>
          </Stack>
        )}

        {status === "error" && (
          <Stack align="center" gap="md">
            <IconX size={48} color="red" />
            <Alert
              icon={<IconX size={16} />}
              title="Connection Failed"
              color="red"
            >
              {errorMessage}
            </Alert>
            <Text size="sm" c="dimmed" ta="center">
              {error ? "Please try connecting again" : "Redirecting..."}
            </Text>
            <Button 
              onClick={() => navigate("/outreach/email/accounts", { replace: true })}
            >
              Go to Accounts
            </Button>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default GmailOAuthCallback;

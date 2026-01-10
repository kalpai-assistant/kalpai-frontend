import React, { useEffect, useState } from "react";
import {
  TextInput,
  Button,
  Title,
  Paper,
  Text,
  Anchor,
  Flex,
} from "@mantine/core";
import styles from "./Login.module.scss";
import { validateEmail } from "../../../utils/utils";
import classNames from "classnames";
import { useMutation } from "react-query";
import { AxiosResponse } from "axios";
import { GenerateTokenResponse } from "../../../api/requests_responses/business";
import { generateToken } from "../../../api/business";
import { MoonLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import { NavigateFromTo } from "../../../utils/constants";

export interface EmailProps {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setOTPToken: React.Dispatch<React.SetStateAction<string>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOTPSendCallback: any;
}

export const Email: React.FC<EmailProps> = ({
  email,
  setEmail,
  setOTPToken,
  setShowModal,
  setOTPSendCallback,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateFrom = location.state?.from || "";
  const [isInvalid, setIsInvalid] = useState(true);
  const [isUnregisteredEmail, setIsUnregisteredEmail] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setIsInvalid(true);
    } else if (isInvalid) {
      setIsInvalid(false); // Reset invalid state when changing input
    }
  };

  const { mutate: OTPMutation, isLoading: isOTPLoading } = useMutation({
    mutationFn: generateToken,
    onSuccess: (data: AxiosResponse<GenerateTokenResponse>) => {
      if (data.data.token) {
        setOTPToken(data.data.token);
        setShowModal(true);
      }
    },
    onError: async () => {
      if (validateEmail(email)) {
        setIsUnregisteredEmail(true);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Add delay
        setIsUnregisteredEmail(false); // Reset before navigation
        navigate("/register", {
          state: {
            email: email,
            from: NavigateFromTo.UNREGISTERED_EMAIL__REGISTER,
          },
        });
      }
    },
  });

  const handleButtonSubmit = () => {
    if (validateEmail(email)) {
      setIsInvalid(false);
      OTPMutation(email); // Trigger OTP generation
    }
  };

  useEffect(() => {
    setIsInvalid(!validateEmail(email));
    setOTPSendCallback(() => (_email: string) => {
      OTPMutation(_email); // Use the email passed into the callback
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  return (
    <Paper shadow="md" p="lg" withBorder className={styles.paper}>
      <Title order={2} className={styles.subtitle}>
        Login
      </Title>
      <TextInput
        placeholder="Email"
        type="email"
        required
        classNames={{ input: styles.input }}
        value={email}
        onChange={handleEmailChange}
        error={isInvalid && email.length > 4 ? "Invalid email" : undefined}
        onSubmit={handleButtonSubmit}
        onSubmitCapture={handleButtonSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleButtonSubmit();
          }
        }}
      />
      <Button
        fullWidth
        mt="md"
        className={classNames(styles.button, { [styles.disabled]: isInvalid })}
        disabled={isInvalid || isOTPLoading}
        onClick={handleButtonSubmit}
      >
        {isOTPLoading || isUnregisteredEmail ? (
          <MoonLoader color="white" size={20} />
        ) : (
          "Get OTP"
        )}
      </Button>
      <Flex justify="center" w="100%">
        {navigateFrom === NavigateFromTo.POST_REGISTER__LOGIN ? (
          <Text size="xs" mt="sm" c="blue">
            Login for the first time & verify your account!
          </Text>
        ) : isUnregisteredEmail ? (
          <Text size="xs" mt="sm" c="cyan">
            Taking you to the registeration page...
          </Text>
        ) : (
          <Text size="xs" mt="sm" c="dark">
            Not Signed up yet?{" "}
            <Anchor
              onClick={() => navigate("/register")}
              size="sm"
              className={styles.link}
              c="cyan"
            >
              Create an account
            </Anchor>
          </Text>
        )}
      </Flex>
    </Paper>
  );
};

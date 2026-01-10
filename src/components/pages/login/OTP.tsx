import React, { useState, useEffect } from "react";
import {
  Button,
  Title,
  Text,
  Anchor,
  Paper,
  PinInput,
  Flex,
} from "@mantine/core";
import { AxiosResponse } from "axios";
import styles from "./Login.module.scss";
import { useMutation } from "react-query";
import { verifyOtp } from "../../../api/business";
import { GenerateTokenResponse } from "../../../api/requests_responses/business";
import { setLocalStorage } from "../../../utils/utils";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { DefaultConstants } from "../../../utils/constants";

interface OTPProps {
  email: string;
  token: string;
  setShowOTPVerify: React.Dispatch<React.SetStateAction<boolean>>;
  OTPSendCallback: (_email: string) => void;
  redirectAfterLogin: string;
}

const OTP: React.FC<OTPProps> = ({
  email,
  token,
  setShowOTPVerify,
  OTPSendCallback,
  redirectAfterLogin,
}: OTPProps) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");
  const [isResendDisabled, setIsResendDisabled] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(DefaultConstants.OTP_RESEND_TIME);
  const [isVerifyEnabled, setIsVerifyEnabled] = useState<boolean>(false);

  // Mutation
  const { mutate: OTPVerifyMutation, isLoading: isOTPVerifyLoading } =
    useMutation<
      AxiosResponse<GenerateTokenResponse>,
      string,
      { otp: string; token: string }
    >(verifyOtp, {
      onSuccess: (data: AxiosResponse<GenerateTokenResponse>) => {
        setLocalStorage(data);
        navigate(redirectAfterLogin === "/login" ? "/" : redirectAfterLogin);
      },
      onError: (error: string) => {
        setOtpError(error);
        setTimer(0);
      },
    });

  const handleVerify = () => {
    setIsVerifyEnabled(true);
    OTPVerifyMutation({ otp, token });
  };

  const handleResendOTP = () => {
    if (typeof OTPSendCallback === "function") {
      setTimer(DefaultConstants.OTP_RESEND_TIME);
      setIsResendDisabled(true);
      setOtpError("");
      setOtp("");
      OTPSendCallback(email);
    } else {
      console.error("OTPSendCallback is not a valid function");
    }
  };

  // Handle OTP input changes
  const handleChange = (value: string) => {
    setOtp(value);
  };

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  return (
    <Paper shadow="md" p="lg" withBorder className={styles.paper}>
      <Title order={6} className={styles.subtitle}>
        <Flex justify="flex-start" gap="xs" align="center">
          <FaArrowLeft
            cursor="pointer"
            onClick={() => setShowOTPVerify(false)}
          />
          Verification
        </Flex>
      </Title>
      <Flex align="center" w="100%" justify="center">
        <PinInput
          length={6}
          type={/^[0-9]*$/}
          onComplete={handleVerify}
          onChange={handleChange}
        />
      </Flex>
      <Flex justify="flex-end">
        {isResendDisabled ? (
          <Text size="sm" mt="sm" c="gray">
            {`0${Math.floor(timer / 60)}:${String(timer % 60).padStart(
              2,
              "0",
            )}`}
          </Text>
        ) : (
          <Anchor
            size="sm"
            mt="sm"
            onClick={handleResendOTP} // Reset timer for resending OTP
          >
            Send Code
          </Anchor>
        )}
      </Flex>
      <Text size="sm" mt="sm" c="gray">
        We sent a verification code to your email:{" "}
        <strong>
          {email.slice(0, 3)}******@{email.split("@")[1]}
        </strong>
        .
      </Text>
      <Button
        mt="lg"
        fullWidth
        onClick={handleVerify}
        loading={isOTPVerifyLoading}
        disabled={!isVerifyEnabled}
        variant={isVerifyEnabled ? "filled" : "outline"}
      >
        Verify
      </Button>
      {otpError && (
        <Flex justify="center" w="100%">
          <Text size="xs" mt="sm" c="red">
            Invalid OTP
          </Text>
        </Flex>
      )}
    </Paper>
  );
};

export default OTP;

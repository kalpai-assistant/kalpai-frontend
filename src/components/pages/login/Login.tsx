import React, { useState } from "react";
import { Title, Container, Text, Flex } from "@mantine/core";
import styles from "./Login.module.scss";
import { ReactComponent as LoginImage } from "../../../assets/images/svg/loginImage.svg";
import { Email } from "./Email";
import OTP from "./OTP";
import { useLocation } from "react-router-dom";

const Login: React.FC = () => {
  const location = useLocation();

  const [otpToken, setOTPToken] = useState("");
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [email, setEmail] = useState(location.state?.email || "");
  const [OTPSendCallback, setOTPSendCallback] = useState<
    (_email: string) => void
  >((_email: string) => {});
  const isExpired = location.state?.isExpired || false;
  const redirectAfterLogin = location.state?.redirectAfterLogin || "/";

  return (
    <div className={styles.wrapper}>
      {/* Left side: Form */}
      <Container size="sm" className={styles.container}>
        <Title className={styles.title}>Airaibot</Title>
        {showOTPVerify ? (
          <OTP
            email={email}
            token={otpToken}
            setShowOTPVerify={setShowOTPVerify}
            OTPSendCallback={OTPSendCallback}
            redirectAfterLogin={redirectAfterLogin}
          />
        ) : (
          <Email
            email={email}
            setEmail={setEmail}
            setOTPToken={setOTPToken}
            setShowModal={setShowOTPVerify}
            setOTPSendCallback={setOTPSendCallback}
          />
        )}
        {isExpired && (
          <Flex align="center" w="100%" justify="center" p="sm">
            <Text c="red" size="sm">
              Session Expired! Please login again
            </Text>
          </Flex>
        )}
      </Container>

      <div className={styles.illustration}>
        <LoginImage />
      </div>
    </div>
  );
};

export default Login;

// components/Modal.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "./OTPModal.module.scss";
import Button from "./Button";
import classNames from "classnames";
import { ButtonColors } from "../../utils/constants";
import { PuffLoader } from "react-spinners";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
  onSubmitOtp: (otp: string) => void;
  showError: boolean;
  otpError: string;
  isLoading: boolean;
}

const OTPModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onRegisterClick,
  onSubmitOtp,
  showError,
  otpError,
  isLoading,
}) => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isShake, setIsShake] = useState(false);
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Handle OTP change and auto-focus next input
  const handleOtpChange = (index: number, value: string) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input if exists
      if (index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace to clear current input or focus previous input
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        // Clear the current input if it has a value
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move focus to previous input if current input is empty
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (otp.every((digit) => digit !== "")) {
      onSubmitOtp(otp.join(""));
    } else {
      setIsShake(true); // Trigger shake animation
      setTimeout(() => setIsShake(false), 500); // Reset shake after animation
    }
  };

  useEffect(() => {
    // Focus the first input when modal opens
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  // Check if all boxes are filled
  const isOtpComplete = otp.every((digit) => digit !== "");

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      {showError ? (
        <div
          className={classNames(styles.modalContent, styles.errorMessage)}
          onClick={(e) => e.stopPropagation()}
        >
          <div>Seems like this email has no business onboarded yet.</div>
          <Button color={ButtonColors.PRIMARY} onClick={onRegisterClick}>
            on-board your business!
          </Button>
        </div>
      ) : (
        <div
          className={classNames(styles.modalContent, {
            [styles.shake]: isShake,
          })}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalTitle}>Verify OTP</div>
          <div className={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el!)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={classNames(styles.otpInput, {
                  [styles.error]: isShake,
                })}
              />
            ))}
          </div>
          {otpError && <div className={styles.modalError}>{otpError}</div>}
          {isLoading ? (
            <PuffLoader />
          ) : (
            <div className={styles.otpButtons}>
              <Button color={ButtonColors.SECONDARY} onClick={onClose}>
                Cancel
              </Button>
              <Button
                color={
                  isOtpComplete ? ButtonColors.PRIMARY : ButtonColors.SECONDARY
                }
                onClick={handleSubmit}
                disabled={!isOtpComplete}
              >
                Get in!
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OTPModal;

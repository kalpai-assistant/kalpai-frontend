import React from "react";
import classNames from "classnames";
import styles from "./TextInput.module.scss";

interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  as?: "input" | "textarea"; // New prop to switch between input and textarea
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  icon,
  iconPosition = "start",
  className,
  as = "input", // Default is input
  ...props
}) => {
  const InputElement = as === "textarea" ? "textarea" : "input"; // Conditionally render input or textarea

  return (
    <div
      className={classNames(styles.inputWrapper, {
        [styles.expanded]: props.value,
      })}
    >
      {label && <label>{label}</label>}
      <div className={styles.inputContainer}>
        {icon && (
          <span
            className={classNames(styles.icon, {
              [styles.iconStart]: iconPosition === "start",
              [styles.iconEnd]: iconPosition === "end",
            })}
          >
            {icon}
          </span>
        )}
        <InputElement
          className={classNames(styles.input, className, {
            [styles.withIcon]: icon && iconPosition === "start",
            [styles.iconEnd]: icon && iconPosition === "end",
          })}
          {...props}
        />
      </div>
    </div>
  );
};

export default TextInput;

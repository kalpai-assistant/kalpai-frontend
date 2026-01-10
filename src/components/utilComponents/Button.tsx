import React from "react";
import styles from "./Button.module.scss";
import classNames from "classnames";
import { ButtonColors } from "../../utils/constants";

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  expanded?: boolean;
  color?: ButtonColors;
  border?: boolean;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  expanded = false,
  className = "",
  color = "primary",
  border = false,
  disabled = false,
  ...props
}) => {
  const buttonClasses = `${styles.button} ${styles[color]} ${
    border ? styles.border : ""
  } ${disabled ? styles.disabled : ""}`;

  return (
    <div
      className={classNames(styles.content, className, buttonClasses, {
        [styles.expanded]: expanded,
      })}
      {...props}
      onClick={disabled ? undefined : props.onClick} // Disable click if `disabled` is true
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
};

export default Button;

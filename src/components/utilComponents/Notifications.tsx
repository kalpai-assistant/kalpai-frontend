import React from "react";
import { Notification } from "@mantine/core";

interface NotificationProps {
  type?: "success" | "error" | "warning" | "info"; // Notification type
  message: string; // Notification message
  header?: string; // Optional header/title
  loading?: boolean;
  onClose?: () => void; // Optional onClose callback
}

const CustomNotification: React.FC<NotificationProps> = ({
  type = "info",
  message,
  header,
  loading = false,
  onClose = () => {},
}) => {
  // Define colors or styles based on notification type
  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "yellow";
      case "info":
      default:
        return "blue";
    }
  };

  return (
    <Notification
      color={getColor(type)}
      title={header}
      onClose={onClose}
      loading={loading}
      withBorder
    >
      {message}
    </Notification>
  );
};

export default CustomNotification;

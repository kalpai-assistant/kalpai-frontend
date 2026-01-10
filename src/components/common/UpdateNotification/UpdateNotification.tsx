import React, { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Group,
  Text,
  ActionIcon,
  Flex,
  Badge,
  Transition,
} from "@mantine/core";
import {
  IconX,
  IconArrowRight,
  IconSparkles,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import styles from "./UpdateNotification.module.scss";

/**
 * UPDATE NOTIFICATION SYSTEM
 *
 * How to add new updates:
 * 1. Add a new entry to the UPDATES array below
 * 2. Set a unique ID for each update (format: "update-YYYY-MM-DD-feature-name")
 * 3. Choose appropriate type: "feature", "improvement", "fix", "announcement"
 * 4. Set the target path for navigation
 * 5. Write compelling title and description
 *
 * The system automatically:
 * - Shows only the latest unread update
 * - Tracks dismissed updates in localStorage
 * - Provides smooth animations and transitions
 * - Handles navigation to the updated feature
 *
 * Example new update:
 * {
 *   id: "update-2025-09-20-new-dashboard",
 *   type: "feature",
 *   title: "New Dashboard Analytics",
 *   description: "Check out the improved dashboard with real-time insights!",
 *   path: "/analytics",
 *   priority: "high"
 * }
 */

export interface UpdateItem {
  id: string;
  type: "feature" | "improvement" | "fix" | "announcement";
  title: string;
  description: string;
  path: string;
  priority?: "low" | "medium" | "high";
  date?: string;
}

// 🚀 ADD NEW UPDATES HERE - Latest updates should be at the top
const UPDATES: UpdateItem[] = [
  {
    id: "update-2025-09-15-telegram-integration",
    type: "feature",
    title: "🤖 Telegram Integration is Live!",
    description:
      "Connect your business with Telegram and start engaging with customers instantly. Set up your bot in just 3 simple steps!",
    path: "/integrations",
    priority: "high",
    date: "Sep 15, 2025",
  },
];

const STORAGE_KEY = "kalp-ai-dismissed-updates";

interface UpdateNotificationProps {
  /** Show only on specific pages (optional) */
  showOnPages?: string[];
  /** Custom position */
  position?: "top" | "bottom";
  /** Auto-hide after seconds (0 = never) */
  autoHideAfter?: number;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  showOnPages,
  position = "top",
  autoHideAfter = 0,
}) => {
  const navigate = useNavigate();
  const [currentUpdate, setCurrentUpdate] = useState<UpdateItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get dismissed updates from localStorage
    const dismissed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as string[];

    // Find the latest update that hasn't been dismissed
    const latestUpdate = UPDATES.find(
      (update) => !dismissed.includes(update.id),
    );

    if (latestUpdate) {
      // Check if we should show on current page
      if (showOnPages && showOnPages.length > 0) {
        const currentPath = window.location.pathname;
        if (!showOnPages.includes(currentPath)) {
          return;
        }
      }

      setCurrentUpdate(latestUpdate);
      setIsVisible(true);

      // Auto-hide if specified
      if (autoHideAfter > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideAfter * 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [showOnPages, autoHideAfter]);

  const handleDismiss = () => {
    if (!currentUpdate) return;

    // Add to dismissed updates
    const dismissed = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]",
    ) as string[];

    dismissed.push(currentUpdate.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));

    // Hide notification
    setIsVisible(false);
  };

  const handleExplore = () => {
    if (!currentUpdate) return;

    // Navigate to the feature
    navigate(currentUpdate.path);

    // Mark as dismissed since user interacted with it
    handleDismiss();
  };

  const getTypeIcon = (type: UpdateItem["type"]) => {
    switch (type) {
      case "feature":
        return <IconSparkles size="1.2rem" />;
      case "improvement":
        return <IconArrowRight size="1.2rem" />;
      case "fix":
        return <IconInfoCircle size="1.2rem" />;
      case "announcement":
        return <IconInfoCircle size="1.2rem" />;
      default:
        return <IconSparkles size="1.2rem" />;
    }
  };

  const getTypeColor = (type: UpdateItem["type"]) => {
    switch (type) {
      case "feature":
        return "blue";
      case "improvement":
        return "green";
      case "fix":
        return "orange";
      case "announcement":
        return "violet";
      default:
        return "blue";
    }
  };

  if (!currentUpdate || !isVisible) {
    return null;
  }

  return (
    <Transition
      mounted={isVisible}
      transition="slide-down"
      duration={300}
      timingFunction="ease-out"
    >
      {(styles_transition) => (
        <div
          style={{
            ...styles_transition,
            position: "fixed",
            [position]: "20px",
            right: "20px",
            zIndex: 1000,
            maxWidth: "400px",
          }}
          className={styles.updateNotification}
        >
          <Alert
            icon={getTypeIcon(currentUpdate.type)}
            title={
              <Flex align="center" gap="sm">
                <Text fw={600} size="sm">
                  {currentUpdate.title}
                </Text>
                <Badge
                  size="xs"
                  color={getTypeColor(currentUpdate.type)}
                  variant="light"
                >
                  {currentUpdate.type}
                </Badge>
                {currentUpdate.priority === "high" && (
                  <Badge size="xs" color="red" variant="filled">
                    New!
                  </Badge>
                )}
              </Flex>
            }
            color={getTypeColor(currentUpdate.type)}
            variant="light"
            styles={{
              root: {
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: `1px solid var(--mantine-color-${getTypeColor(
                  currentUpdate.type,
                )}-3)`,
              },
            }}
          >
            <Text size="sm" c="dimmed" mb="md">
              {currentUpdate.description}
            </Text>

            {currentUpdate.date && (
              <Text size="xs" c="dimmed" mb="sm">
                Released: {currentUpdate.date}
              </Text>
            )}

            <Group justify="space-between" align="center">
              <Button
                variant="light"
                color={getTypeColor(currentUpdate.type)}
                size="sm"
                rightSection={<IconArrowRight size="1rem" />}
                onClick={handleExplore}
              >
                Explore Now
              </Button>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleDismiss}
              >
                <IconX size="1rem" />
              </ActionIcon>
            </Group>
          </Alert>
        </div>
      )}
    </Transition>
  );
};

export default UpdateNotification;

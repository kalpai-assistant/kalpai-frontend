import {
  IconDashboard,
  IconDatabase,
  IconRobot,
  IconChartBar,
  IconPlug,
  IconMessageCircle,
  IconBell,
  IconSend,
  IconUsers,
} from "@tabler/icons-react";

export enum UserLocalStorageTypes {
  USER_DATA = "userData",
  USER_OTP = "userOtp",
  ADMIN_ACCESS_EMAIL = "adminAccessEmail",
}

export enum ButtonColors {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  DANGER = "danger",
  WARNING = "warning",
  INFO = "info",
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
  GRAY = "gray",
}

export enum NavigateFromTo {
  POST_REGISTER__LOGIN = "postRegister",
  UNREGISTERED_EMAIL__REGISTER = "unregisteredEmail",
}

export enum ExternalServiceURLs {
  IPIFY = "https://api.ipify.org",
}

export enum PageSizes {
  CHAT_HISTORY = 10,
}

export enum DefaultConstants {
  OTP_RESEND_TIME = 10, // in seconds
}

export const NavbarConfigMap: {
  [key: string]: {
    path: string;
    bgColor: string;
    icon: React.ComponentType<any>;
  };
} = {
  Dashboard: {
    path: "/",
    bgColor: "#f4f4f4",
    icon: IconDashboard,
  },
  "Business Data": {
    path: "/data",
    bgColor: "#f4f4f4",
    icon: IconDatabase,
  },
  Assistant: {
    path: "/talk",
    bgColor: "#f4f4f4",
    icon: IconRobot,
  },
  Analytics: {
    path: "/analytics",
    bgColor: "#f4f4f4",
    icon: IconChartBar,
  },
  Team: {
    path: "/team",
    bgColor: "white",
    icon: IconUsers,
  },
  Integrations: {
    path: "/integrations",
    bgColor: "#f4f4f4",
    icon: IconPlug,
  },
  Interactions: {
    path: "/chats",
    bgColor: "white",
    icon: IconMessageCircle,
  },
  Notifications: {
    path: "/notifications",
    bgColor: "white",
    icon: IconBell,
  },
  Outreach: {
    path: "/outreach",
    bgColor: "#f4f4f4",
    icon: IconSend,
  },
};

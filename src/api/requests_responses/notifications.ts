export interface NotificationResponse {
  id: number;
  created_time: string;
  chat_session_id: string;
  notification_text: string;
  opened_time?: string;
}

export interface NotificationsResponse {
  items: NotificationResponse[];
  page: number;
  total: number;
  size: number;
  pages: number;
}

export const NotificationQueryNames = {
  NOTIFICATIONS: "NOTIFICATIONS",
  NOTIFICATION_OPEN: "NOTIFICATION_OPEN",
};

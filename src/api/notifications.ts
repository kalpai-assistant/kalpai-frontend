import { AxiosResponse } from "axios";
import { apiClient } from "./apiHelper";
import { NotificationsResponse } from "./requests_responses/notifications";
import { StandardResponse } from "./requests_responses/business";

export const getNotifications = async (
  notificationState: string,
  page: number,
  size: number,
): Promise<AxiosResponse<NotificationsResponse>> => {
  return apiClient.get<NotificationsResponse>("/notification/", {
    notification_state: notificationState,
    page,
    size,
  });
};

export const notificationOpened = async (
  notification_id: number,
): Promise<AxiosResponse<StandardResponse>> => {
  return apiClient.put<StandardResponse>(
    `/notification/open/${notification_id}`,
  );
};

import React, { useState } from "react";
import {
  Stack,
  Switch,
  Select,
  Group,
  Text,
  Button,
  Checkbox,
  Alert,
  Divider,
  Paper,
} from "@mantine/core";
import { IconCopy, IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  getSendingSchedule,
  updateSendingSchedule,
} from "../../../../../api/outreach/email";
import { EmailOutreachQueryNames } from "../../../../../api/requests_responses/outreach/email";

interface SendingScheduleFormProps {
  campaignId: number;
}

// Helper function to generate time options
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeValue = `${String(hour).padStart(2, "0")}:${String(
        minute,
      ).padStart(2, "0")}`;
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const displayMinute = String(minute).padStart(2, "0");
      times.push({
        value: timeValue,
        label: `${displayHour}:${displayMinute} ${ampm}`,
      });
    }
  }
  return times;
};

const TIMEZONE_OPTIONS = [
  { value: "Asia/Kolkata", label: "Indian Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "British Time (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
  { value: "UTC", label: "UTC" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const SendingScheduleForm: React.FC<SendingScheduleFormProps> = ({
  campaignId,
}) => {
  const queryClient = useQueryClient();
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00" },
    saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
    sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
  });
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const { isLoading } = useQuery(
    [EmailOutreachQueryNames.GET_SENDING_SCHEDULE, campaignId],
    () => getSendingSchedule(campaignId),
    {
      onSuccess: (response) => {
        const data = response.data;
        setScheduleEnabled(data.enabled);
        setTimezone(data.timezone);

        // Convert API windows to weekSchedule
        const newWeekSchedule: WeekSchedule = {
          monday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          tuesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          wednesday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          thursday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          friday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          saturday: { enabled: false, startTime: "09:00", endTime: "17:00" },
          sunday: { enabled: false, startTime: "09:00", endTime: "17:00" },
        };

        data.windows.forEach((window) => {
          window.days.forEach((day) => {
            if (day in newWeekSchedule) {
              newWeekSchedule[day as keyof WeekSchedule] = {
                enabled: true,
                startTime: window.start_time,
                endTime: window.end_time,
              };
            }
          });
        });

        setWeekSchedule(newWeekSchedule);
      },
      onError: () => {
        setError("Failed to load schedule");
      },
    },
  );

  const saveMutation = useMutation(
    () => {
      // Convert weekSchedule to API format (windows array)
      const windows = Object.entries(weekSchedule)
        .filter(([_, daySchedule]) => daySchedule.enabled)
        .map(([day, daySchedule]) => ({
          days: [day],
          start_time: daySchedule.startTime,
          end_time: daySchedule.endTime,
        }));

      return updateSendingSchedule(campaignId, {
        timezone,
        windows,
        enabled: scheduleEnabled,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          EmailOutreachQueryNames.GET_SENDING_SCHEDULE,
          campaignId,
        ]);
        queryClient.invalidateQueries(EmailOutreachQueryNames.GET_CAMPAIGNS);
        setSuccessMessage("Schedule saved successfully!");
        setError("");
        setTimeout(() => setSuccessMessage(""), 3000);
      },
      onError: (err: any) => {
        setError(
          err?.response?.data?.detail ||
            "Failed to save schedule. Please try again.",
        );
        setSuccessMessage("");
      },
    },
  );

  const handleDayToggle = (day: keyof WeekSchedule, checked: boolean) => {
    setWeekSchedule({
      ...weekSchedule,
      [day]: {
        ...weekSchedule[day],
        enabled: checked,
      },
    });
  };

  const handleTimeChange = (
    day: keyof WeekSchedule,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setWeekSchedule({
      ...weekSchedule,
      [day]: {
        ...weekSchedule[day],
        [field]: value,
      },
    });
  };

  const handleCopyToAll = () => {
    // Find the first enabled day to use as template
    const templateDay = DAYS_OF_WEEK.find(
      (d) => weekSchedule[d.value as keyof WeekSchedule].enabled,
    );

    if (!templateDay) return;

    const template = weekSchedule[templateDay.value as keyof WeekSchedule];
    const newSchedule = { ...weekSchedule };

    DAYS_OF_WEEK.forEach((day) => {
      if (weekSchedule[day.value as keyof WeekSchedule].enabled) {
        newSchedule[day.value as keyof WeekSchedule] = {
          ...weekSchedule[day.value as keyof WeekSchedule],
          startTime: template.startTime,
          endTime: template.endTime,
        };
      }
    });

    setWeekSchedule(newSchedule);
  };

  const handleSave = () => {
    setError("");
    setSuccessMessage("");

    const enabledDaysCount = DAYS_OF_WEEK.filter(
      (d) => weekSchedule[d.value as keyof WeekSchedule].enabled,
    ).length;

    if (scheduleEnabled && enabledDaysCount === 0) {
      setError("Please enable at least one day");
      return;
    }

    saveMutation.mutate();
  };

  const enabledDaysCount = DAYS_OF_WEEK.filter(
    (d) => weekSchedule[d.value as keyof WeekSchedule].enabled,
  ).length;

  if (isLoading) {
    return (
      <Text size="sm" c="dimmed">
        Loading schedule...
      </Text>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {successMessage && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Success"
            color="green"
            withCloseButton
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            withCloseButton
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        <Switch
          label="Enable Sending Schedule"
          description="Control when emails are sent automatically"
          checked={scheduleEnabled}
          onChange={(e) => setScheduleEnabled(e.currentTarget.checked)}
        />

        {scheduleEnabled && (
          <>
            <Select
              label="Timezone"
              placeholder="Select timezone"
              data={TIMEZONE_OPTIONS}
              value={timezone}
              onChange={(value) => setTimezone(value || "Asia/Kolkata")}
              searchable
              required
            />

            <Divider label="Working Hours by Day" labelPosition="center" />

            <Stack gap="xs">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule =
                  weekSchedule[day.value as keyof WeekSchedule];
                return (
                  <Group key={day.value} gap="xs" wrap="nowrap">
                    <Checkbox
                      checked={daySchedule.enabled}
                      onChange={(e) =>
                        handleDayToggle(
                          day.value as keyof WeekSchedule,
                          e.currentTarget.checked,
                        )
                      }
                      style={{ minWidth: 120 }}
                      label={day.label}
                    />
                    {daySchedule.enabled && (
                      <>
                        <Select
                          placeholder="Start"
                          data={generateTimeOptions()}
                          value={daySchedule.startTime}
                          onChange={(value) =>
                            handleTimeChange(
                              day.value as keyof WeekSchedule,
                              "startTime",
                              value || "09:00",
                            )
                          }
                          searchable
                          size="xs"
                          style={{ flex: 1 }}
                        />
                        <Text size="sm" c="dimmed">
                          to
                        </Text>
                        <Select
                          placeholder="End"
                          data={generateTimeOptions()}
                          value={daySchedule.endTime}
                          onChange={(value) =>
                            handleTimeChange(
                              day.value as keyof WeekSchedule,
                              "endTime",
                              value || "17:00",
                            )
                          }
                          searchable
                          size="xs"
                          style={{ flex: 1 }}
                        />
                      </>
                    )}
                  </Group>
                );
              })}
            </Stack>

            {enabledDaysCount > 1 && (
              <Button
                variant="light"
                leftSection={<IconCopy size={16} />}
                onClick={handleCopyToAll}
                size="xs"
              >
                Copy first enabled day's hours to all enabled days
              </Button>
            )}

            {enabledDaysCount === 0 && (
              <Alert color="red">Please enable at least one day</Alert>
            )}

            {enabledDaysCount > 0 && (
              <Alert color="blue">
                Schedule configured for {enabledDaysCount} day
                {enabledDaysCount > 1 ? "s" : ""} in {timezone}
              </Alert>
            )}
          </>
        )}

        <Group justify="flex-end">
          <Button onClick={handleSave} loading={saveMutation.isLoading}>
            Save Schedule
          </Button>
        </Group>
      </Stack>
    </Paper>
  );
};

export default SendingScheduleForm;

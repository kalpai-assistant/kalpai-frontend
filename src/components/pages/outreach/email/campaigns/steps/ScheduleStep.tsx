import React from "react";
import {
  Stack,
  Switch,
  Select,
  Group,
  Text,
  Checkbox,
  Alert,
  Button,
  Divider,
} from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";

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

export interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface ScheduleStepProps {
  scheduleEnabled: boolean;
  setScheduleEnabled: (enabled: boolean) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  weekSchedule: WeekSchedule;
  setWeekSchedule: (schedule: WeekSchedule) => void;
}

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  scheduleEnabled,
  setScheduleEnabled,
  timezone,
  setTimezone,
  weekSchedule,
  setWeekSchedule,
}) => {
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

  const enabledDaysCount = DAYS_OF_WEEK.filter(
    (d) => weekSchedule[d.value as keyof WeekSchedule].enabled,
  ).length;

  return (
    <Stack gap="md" mt="md">
      <Switch
        label="Enable Sending Schedule"
        description="Set working hours and days for automated sending"
        checked={scheduleEnabled}
        onChange={(e) => setScheduleEnabled(e.currentTarget.checked)}
      />

      {scheduleEnabled ? (
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
              const daySchedule = weekSchedule[day.value as keyof WeekSchedule];
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
      ) : (
        <Alert color="blue">
          Campaign will be saved as draft. You can configure the sending
          schedule later and start it manually.
        </Alert>
      )}
    </Stack>
  );
};

export default ScheduleStep;

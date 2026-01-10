import { Flex, Grid, Loader, Text, Title } from "@mantine/core";
import { useQuery } from "react-query";
import {
  BusinessOverviewStats,
  BusinessQueryNames,
} from "../../../../api/requests_responses/business";
import { businessQuickStats } from "../../../../api/business";
import { FaUserAlt, FaUserFriends } from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import { IconClock, IconMessage, IconPhone } from "@tabler/icons-react";
import { useState } from "react";
import { RefetchButton } from "../CommonUtils";
import { getVoiceAnalyticsSummary } from "../../../../api/voiceAnalytics";
import { VoiceAnalyticsSummary } from "../../../../api/requests_responses/voiceAnalytics";

interface StatProps {
  Logo: JSX.Element;
  value: number | string;
  label: string;
}

const Stat: React.FC<StatProps> = ({ Logo, value, label }) => {
  return (
    <Flex gap="md" align="center" p={1}>
      {Logo}
      <Flex direction="column" justify="center">
        <Title order={3}>{value}</Title>
        <Text c="gray" size="xs">
          {label}
        </Text>
      </Flex>
    </Flex>
  );
};

const LOGO_ALT = {
  color: "gray",
  size: 28,
};

const KeyLogoMap = {
  total_interactions: (
    <FaUserFriends size={LOGO_ALT.size} color={LOGO_ALT.color} />
  ),
  unique_interactions: (
    <FaUserAlt size={LOGO_ALT.size} color={LOGO_ALT.color} />
  ),
  unique_locations: <GoLocation size={LOGO_ALT.size} color={LOGO_ALT.color} />,
  total_messages: <IconMessage size={LOGO_ALT.size} color={LOGO_ALT.color} />,
  voice_total_calls: <IconPhone size={LOGO_ALT.size} color={LOGO_ALT.color} />,
  voice_total_minutes: (
    <IconClock size={LOGO_ALT.size} color={LOGO_ALT.color} />
  ),
  default: <FaUserAlt size={LOGO_ALT.size} color={LOGO_ALT.color} />, // Fallback icon
};

const OverviewStats: React.FC = () => {
  const [quickStats, setQuickStats] = useState<BusinessOverviewStats | null>(
    null,
  );
  const { isLoading: isLoadingQuickStats, refetch: refetchQuickStats } =
    useQuery(BusinessQueryNames.GET_QUICK_STATS, () => businessQuickStats(), {
      onSuccess: (data) => {
        setQuickStats(data.data);
      },
      refetchOnWindowFocus: false,
    });

  const [voiceSummary, setVoiceSummary] =
    useState<VoiceAnalyticsSummary | null>(null);
  const { isLoading: isLoadingVoiceSummary, refetch: refetchVoiceSummary } =
    useQuery("VOICE-ANALYTICS-SUMMARY", () => getVoiceAnalyticsSummary(), {
      onSuccess: (resp) => {
        setVoiceSummary(resp.data);
      },
      refetchOnWindowFocus: false,
    });

  const refetchAll = async () => {
    await Promise.all([refetchQuickStats(), refetchVoiceSummary()]);
  };

  if (
    (isLoadingQuickStats && !quickStats) ||
    (isLoadingVoiceSummary && !voiceSummary)
  ) {
    return <Loader />;
  }

  return (
    // <Flex gap="md" direction="row">
    <Flex direction="column" gap={0}>
      <RefetchButton
        refetch={refetchAll}
        isLoading={isLoadingQuickStats || isLoadingVoiceSummary}
      />
      <Grid grow p={1}>
        {quickStats &&
          Object.keys(quickStats).map((key) => {
            const Logo =
              KeyLogoMap[key as keyof typeof KeyLogoMap] || KeyLogoMap.default;

            if (!Logo) {
              console.warn(`No logo found for key: ${key}`);
              return null; // Skip rendering if no matching logo
            }

            return (
              <Grid.Col span={6} key={key}>
                <Stat
                  Logo={Logo}
                  value={quickStats[key as keyof typeof quickStats] || 0}
                  label={key
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (match) => match.toUpperCase())}
                />
              </Grid.Col>
            );
          })}

        {voiceSummary && (
          <>
            <Grid.Col span={6} key="voice_total_calls">
              <Stat
                Logo={KeyLogoMap.voice_total_calls}
                value={voiceSummary.total_calls}
                label="Total Calls"
              />
            </Grid.Col>
            <Grid.Col span={6} key="voice_total_minutes">
              <Stat
                Logo={KeyLogoMap.voice_total_minutes}
                value={voiceSummary.total_duration_minutes}
                label="Total Minutes"
              />
            </Grid.Col>
          </>
        )}
      </Grid>
    </Flex>
  );
};

export default OverviewStats;

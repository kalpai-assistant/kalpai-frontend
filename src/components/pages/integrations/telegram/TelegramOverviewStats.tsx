import { Flex, Grid, Loader, Text, Title } from "@mantine/core";
import { useQuery } from "react-query";
import {
  BusinessOverviewStats,
  BusinessQueryNames,
} from "../../../../api/requests_responses/business";
import { businessQuickStats } from "../../../../api/business";
import { FaUserAlt, FaUserFriends } from "react-icons/fa";
import { GoLocation } from "react-icons/go";
import { IconMessage } from "@tabler/icons-react";
import { useState } from "react";
import { RefetchButton } from "../../business/CommonUtils";

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

const TelegramKeyLogoMap = {
  total_interactions: (
    <FaUserFriends size={LOGO_ALT.size} color={LOGO_ALT.color} />
  ),
  unique_interactions: (
    <FaUserAlt size={LOGO_ALT.size} color={LOGO_ALT.color} />
  ),
  unique_locations: <GoLocation size={LOGO_ALT.size} color={LOGO_ALT.color} />,
  total_messages: <IconMessage size={LOGO_ALT.size} color={LOGO_ALT.color} />,
  default: <FaUserAlt size={LOGO_ALT.size} color={LOGO_ALT.color} />, // Fallback icon
};

const TelegramOverviewStats: React.FC = () => {
  const [quickStats, setQuickStats] = useState<BusinessOverviewStats | null>(
    null,
  );

  const { isLoading: isLoadingQuickStats, refetch: refetchQuickStats } =
    useQuery(
      [BusinessQueryNames.GET_QUICK_STATS, "telegram"],
      () => businessQuickStats("telegram"),
      {
        onSuccess: (data) => {
          setQuickStats(data.data);
        },
        refetchOnWindowFocus: false,
      },
    );

  if (isLoadingQuickStats && !quickStats) {
    return <Loader />;
  }

  return (
    <Flex direction="column" gap={0}>
      <RefetchButton
        refetch={refetchQuickStats}
        isLoading={isLoadingQuickStats}
      />
      <Grid grow p={1}>
        {quickStats &&
          Object.keys(quickStats).map((key) => {
            const Logo =
              TelegramKeyLogoMap[key as keyof typeof TelegramKeyLogoMap] ||
              TelegramKeyLogoMap.default;

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
      </Grid>
    </Flex>
  );
};

export default TelegramOverviewStats;

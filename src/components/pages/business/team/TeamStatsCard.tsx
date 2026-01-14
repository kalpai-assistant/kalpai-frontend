import { Paper, Grid, Text, Badge, Flex, Box } from "@mantine/core";
import {
  IconUsers,
  IconUserCheck,
  IconClock,
  IconShieldCheck,
} from "@tabler/icons-react";
import { TeamStatsResponse } from "../../../../api/requests_responses/team";

interface TeamStatsCardProps {
  stats: TeamStatsResponse;
  loading?: boolean;
}

const TeamStatsCard: React.FC<TeamStatsCardProps> = ({ stats, loading }) => {
  const statCards = [
    {
      title: "Total Members",
      value: stats.total_members,
      icon: IconUsers,
      color: "blue",
    },
    {
      title: "Active Members",
      value: stats.active_members,
      icon: IconUserCheck,
      color: "green",
      badge: stats.total_members
        ? `${Math.round((stats.active_members / stats.total_members) * 100)}%`
        : "0%",
    },
    {
      title: "Pending Invitations",
      value: stats.pending_invitations,
      icon: IconClock,
      color: stats.pending_invitations > 0 ? "yellow" : "gray",
    },
    {
      title: "Admins & Owners",
      value: (stats.by_role_type.admin || 0) + (stats.by_role_type.owner || 0),
      icon: IconShieldCheck,
      color: "violet",
    },
  ];

  return (
    <Grid gutter="md">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Grid.Col key={index} span={{ base: 12, xs: 6, md: 3 }}>
            <Paper
              shadow="sm"
              p="md"
              radius="md"
              withBorder
              style={{
                transition: "all 0.3s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <Flex justify="space-between" align="flex-start">
                <Box>
                  <Text size="xs" c="dimmed" mb={4}>
                    {card.title}
                  </Text>
                  <Flex align="baseline" gap="xs">
                    <Text size="2rem" fw={700} style={{ lineHeight: 1 }}>
                      {loading ? "..." : card.value}
                    </Text>
                    {card.badge && !loading && (
                      <Badge color={card.color} variant="light" size="sm">
                        {card.badge}
                      </Badge>
                    )}
                  </Flex>
                </Box>
                <IconComponent
                  size={32}
                  stroke={1.5}
                  style={{
                    opacity: 0.6,
                    color: `var(--mantine-color-${card.color}-6)`,
                  }}
                />
              </Flex>
            </Paper>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default TeamStatsCard;

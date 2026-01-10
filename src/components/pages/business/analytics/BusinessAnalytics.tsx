import { LoadingOverlay, SimpleGrid, Title } from "@mantine/core";
import { Tile } from "../../../utilComponents/Tile";
import ChatHeatMap from "./BusinessChatHeatMap";
import InteractionsTrend from "./BusinessInteractionTrend";

const BusinessAnalytics: React.FC = () => (
  <>
    {/* TODO: Add Analytics this is a temporary thing, to be removed in the next PR. */}
    <div style={{ position: "relative" }}>
      <LoadingOverlay
        visible={true}
        loaderProps={{
          children: <Title order={3}>We're working on it.</Title>,
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 2 }}>
        <InteractionsTrend />
        <Tile title="Top Locations">
          <ChatHeatMap />
        </Tile>
      </SimpleGrid>
    </div>
  </>
);

export default BusinessAnalytics;

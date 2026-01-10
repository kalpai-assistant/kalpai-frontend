import { Grid } from "@mantine/core";
import BusinessProfile from "./BusinessProfile";
import OverviewStats from "./BusinessOverviewStats";
import QRCode from "./BusinessQRCode";
import BotIntegration from "./BusinessBotIntegration";
import { Tile } from "../../../utilComponents/Tile";
import ChatIntroLine from "../intro/ChatIntroLine";
import ChatIntroImage from "../intro/ChatIntroImage";
import { UpdateNotification } from "../../../common/UpdateNotification";

const BusinessDashboard: React.FC = () => (
  <>
    {/* Update Notification System - Shows latest unread updates */}
    <UpdateNotification showOnPages={["/"]} position="top" autoHideAfter={0} />

    <Grid gutter="md">
      {/* Left Column */}
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Tile title="Assistant Profile">
          <BusinessProfile />
        </Tile>
        <Tile title="Conversation Starter">
          <ChatIntroLine />
        </Tile>
        <Tile title="Bot QR Code">
          <QRCode />
        </Tile>
      </Grid.Col>

      {/* Right Column */}
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Tile title="Quick Stats">
          <OverviewStats />
        </Tile>
        <Tile title="Introductory Images">
          <ChatIntroImage />
        </Tile>
        <Tile title="Integrate with your Website">
          <BotIntegration />
        </Tile>
      </Grid.Col>
    </Grid>
  </>
);

export default BusinessDashboard;

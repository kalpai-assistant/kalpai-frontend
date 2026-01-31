import React, { useState, useEffect } from "react";
import { Paper, Tabs, Text } from "@mantine/core";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import WhatsAppAccounts from "./accounts/WhatsAppAccounts";
import WhatsAppOAuthCallback from "./accounts/WhatsAppOAuthCallback";
import WhatsAppTemplates from "./templates/WhatsAppTemplates";
import WhatsAppCampaigns from "./campaigns/WhatsAppCampaigns";
import CreateWhatsAppCampaign from "./campaigns/CreateWhatsAppCampaign";
import WhatsAppCampaignDetails from "./campaigns/WhatsAppCampaignDetails";
import WhatsAppConversations from "./conversations/WhatsAppConversations";

const WhatsAppOutreach: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes("/templates")) return "templates";
    if (location.pathname.includes("/campaigns")) return "campaigns";
    if (location.pathname.includes("/conversations")) return "conversations";
    if (location.pathname.includes("/accounts")) return "accounts";
    return "accounts";
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Navigate to default tab if no sub-path exists
  useEffect(() => {
    const path = location.pathname;
    // If path is exactly /outreach/whatsapp or /outreach/whatsapp/, navigate to accounts
    if (
      path === "/outreach/whatsapp" ||
      path === "/outreach/whatsapp/" ||
      (!path.includes("/accounts") &&
        !path.includes("/templates") &&
        !path.includes("/campaigns") &&
        !path.includes("/conversations") &&
        !path.includes("/oauth"))
    ) {
      navigate("/outreach/whatsapp/accounts", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (value: string | null) => {
    const tab = value || "accounts";
    setActiveTab(tab);
    navigate(`/outreach/whatsapp/${tab}`);
  };

  return (
    <>
      <Paper p="md" shadow="sm">
        <Text size="lg" fw={600} mb="md">
          WhatsApp Outreach
        </Text>

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="accounts">Accounts</Tabs.Tab>
            <Tabs.Tab value="templates">Templates</Tabs.Tab>
            <Tabs.Tab value="campaigns">Campaigns</Tabs.Tab>
            <Tabs.Tab value="conversations">AI Conversations</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="accounts" pt="md">
            <Routes>
              <Route path="/accounts" element={<WhatsAppAccounts />} />
              <Route path="/accounts/" element={<WhatsAppAccounts />} />
              <Route
                path="/accounts/oauth/callback"
                element={<WhatsAppOAuthCallback />}
              />
              <Route path="/accounts/*" element={<WhatsAppAccounts />} />
              <Route path="/" element={<WhatsAppAccounts />} />
            </Routes>
          </Tabs.Panel>

          <Tabs.Panel value="templates" pt="md">
            <Routes>
              <Route path="/templates" element={<WhatsAppTemplates />} />
              <Route path="/templates/" element={<WhatsAppTemplates />} />
            </Routes>
          </Tabs.Panel>

          <Tabs.Panel value="campaigns" pt="md">
            <Routes>
              <Route path="/campaigns" element={<WhatsAppCampaigns />} />
              <Route
                path="/campaigns/create"
                element={<CreateWhatsAppCampaign />}
              />
              <Route
                path="/campaigns/:campaignId"
                element={<WhatsAppCampaignDetails />}
              />
            </Routes>
          </Tabs.Panel>

          <Tabs.Panel value="conversations" pt="md">
            <Routes>
              <Route
                path="/conversations"
                element={<WhatsAppConversations />}
              />
            </Routes>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
};

export default WhatsAppOutreach;

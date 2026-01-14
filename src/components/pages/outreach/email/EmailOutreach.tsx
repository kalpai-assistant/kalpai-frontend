import React, { useState, useEffect } from "react";
import { Paper, Tabs, Text } from "@mantine/core";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import GmailAccounts from "./accounts/GmailAccounts";
import GmailOAuthCallback from "./accounts/GmailOAuthCallback";
import EmailLists from "./lists/EmailLists";
import EmailCampaigns from "./campaigns/EmailCampaigns";
import CreateEmailList from "./lists/CreateEmailList";
import EmailListDetails from "./lists/EmailListDetails";
import CreateEmailCampaign from "./campaigns/CreateEmailCampaign";
import EditEmailCampaign from "./campaigns/EditEmailCampaign";
import EmailCampaignDetails from "./campaigns/EmailCampaignDetails";

const EmailOutreach: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes("/lists")) return "lists";
    if (location.pathname.includes("/campaigns")) return "campaigns";
    if (location.pathname.includes("/team")) return "team";
    if (location.pathname.includes("/accounts")) return "accounts";
    return "accounts";
  };

  const [activeTab, setActiveTab] = useState<string>(getActiveTab());

  // Navigate to default tab if no sub-path exists
  useEffect(() => {
    const path = location.pathname;
    // If path is exactly /outreach/email or /outreach/email/, navigate to accounts
    if (
      path === "/outreach/email" ||
      path === "/outreach/email/" ||
      (!path.includes("/accounts") &&
        !path.includes("/lists") &&
        !path.includes("/campaigns") &&
        !path.includes("/team") &&
        !path.includes("/oauth"))
    ) {
      navigate("/outreach/email/accounts", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (value: string | null) => {
    const tab = value || "accounts";
    setActiveTab(tab);
    navigate(`/outreach/email/${tab}`);
  };

  return (
    <>
      <Paper p="md" shadow="sm">
        <Text size="lg" fw={600} mb="md">
          Email Outreach
        </Text>

        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Tab value="accounts">Gmail Accounts</Tabs.Tab>
            <Tabs.Tab value="lists">Email Lists</Tabs.Tab>
            <Tabs.Tab value="campaigns">Campaigns</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="accounts" pt="md">
            <Routes>
              <Route path="/accounts" element={<GmailAccounts />} />
              <Route path="/accounts/" element={<GmailAccounts />} />
              <Route
                path="/accounts/oauth/callback"
                element={<GmailOAuthCallback />}
              />
              <Route path="/accounts/*" element={<GmailAccounts />} />
              <Route path="/" element={<GmailAccounts />} />
            </Routes>
          </Tabs.Panel>

          <Tabs.Panel value="lists" pt="md">
            <Routes>
              <Route path="/lists" element={<EmailLists />} />
              <Route path="/lists/create" element={<CreateEmailList />} />
              <Route path="/lists/:listId" element={<EmailListDetails />} />
            </Routes>
          </Tabs.Panel>

          <Tabs.Panel value="campaigns" pt="md">
            <Routes>
              <Route path="/campaigns" element={<EmailCampaigns />} />
              <Route
                path="/campaigns/create"
                element={<CreateEmailCampaign />}
              />
              <Route
                path="/campaigns/:campaignId/edit"
                element={<EditEmailCampaign />}
              />
              <Route
                path="/campaigns/:campaignId"
                element={<EmailCampaignDetails />}
              />
            </Routes>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
};

export default EmailOutreach;

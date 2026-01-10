// src/App.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
  Outlet,
} from "react-router-dom";
import BusinessRegister from "./components/pages/business/BusinessRegister";
import {
  apiClient,
  setAuthorizationHeader,
  setHeaderEmail,
} from "./api/apiHelper";
import {
  getAdminAccessData,
  getUserData,
  unsetLocalStorage,
} from "./utils/utils";
import Chat from "./components/pages/chat/Chat";
import CreateChat from "./components/pages/chat/CreateChat";
import ErrorPage from "./components/pages/Error";
import AdminBusiness from "./components/pages/AdminBusiness";
import "@mantine/core/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/dropzone/styles.css";
import Business from "./components/pages/business/Business";
import BusinessData from "./components/pages/business/BusinessData";
import ChatHistory from "./components/pages/chat/BusinessChatHistory";
import Login from "./components/pages/login/Login";
import BusinessDashboard from "./components/pages/business/dashboard/BusinessDashboard";
import BusinessAnalytics from "./components/pages/business/analytics/BusinessAnalytics";
import Notifications from "./components/pages/notifications/Notification";
import Integrations from "./components/pages/integrations/Integrations";
import Outreach from "./components/pages/outreach/Outreach";
import GmailOAuthCallback from "./components/pages/outreach/email/accounts/GmailOAuthCallback";
import { initializeCognito } from "./services/cognitoConfig";

function SetNavigateInApiClient() {
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.setNavigate(navigate);
  }, [navigate]);

  return null;
}

interface AuthProtectedProps {
  isAdmin?: boolean;
}

const AuthProtected: React.FC<AuthProtectedProps> = ({ isAdmin = false }) => {
  const user = getUserData();
  const adminAccessEmail = getAdminAccessData();
  const previousPath = window.location.pathname + window.location.search;
  if (!user) {
    unsetLocalStorage();
    return (
      <Navigate to="/login" state={{ redirectAfterLogin: previousPath }} />
    );
  }

  if (isAdmin && !user.is_admin) {
    unsetLocalStorage();
    return (
      <Navigate to="/login" state={{ redirectAfterLogin: previousPath }} />
    );
  }

  setAuthorizationHeader(user.token);
  if (adminAccessEmail) setHeaderEmail(adminAccessEmail);
  return <Outlet />;
};

const App: React.FC = () => {
  // Initialize Cognito on app startup
  useEffect(() => {
    initializeCognito();
  }, []);

  return (
    <Router>
      <SetNavigateInApiClient />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<BusinessRegister />} />
        <Route path="/business/:businessID" element={<CreateChat />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/chat/:sessionID" element={<Chat />} />
        <Route element={<AuthProtected isAdmin />}>
          <Route path="/admin/business" element={<AdminBusiness />} />
        </Route>
        <Route element={<AuthProtected />}>
          <Route element={<Business />}>
            <Route path="/" element={<BusinessDashboard />} />
            <Route path="/data" element={<BusinessData />} />
            <Route path="/analytics" element={<BusinessAnalytics />} />
            <Route
              path="/chats"
              element={<ChatHistory showSourceLogos={true} />}
            />
            <Route path="/talk" element={<Chat sessionId="business/talk" />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/outreach/*" element={<Outreach />} />
            <Route
              path="/outreach/email/oauth/callback"
              element={<GmailOAuthCallback />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;

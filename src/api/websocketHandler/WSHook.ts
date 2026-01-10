import { useEffect, useState, useRef, useCallback } from "react";
import wsManager from "./chatWS";
import { useNavigate } from "react-router-dom";
import { getUserData, unsetLocalStorage } from "../../utils/utils";

const useWebSocket = (
  sessionID: string,
  onMessage: (data: string) => void,
  isAdmin: boolean,
) => {
  const [sendMessage, setSendMessage] = useState<
    ((message: string) => void) | null
  >(null);
  const navigate = useNavigate();
  const currentSessionID = useRef<string | null>(null); // Track session ID

  useEffect(() => {
    if (!sessionID) return;

    // If sessionID has changed, close the previous connection
    if (currentSessionID.current && currentSessionID.current !== sessionID) {
      wsManager.close();
    }

    currentSessionID.current = sessionID; // Update session tracking

    // Connect WebSocket
    if (sessionID === "business/talk") {
      const user = getUserData();
      if (!user) {
        unsetLocalStorage();
        navigate("/login");
        return;
      }
      wsManager.connect(sessionID, isAdmin, user.token);
    } else {
      wsManager.connect(sessionID, isAdmin);
    }

    wsManager.setNavigate(navigate);
    setSendMessage(() => (message: string) => wsManager.sendMessage(message));

    // Add message listener
    wsManager.addMessageListener(onMessage);

    // Cleanup on unmount or sessionID change
    return () => {
      wsManager.removeMessageListener(onMessage);
    };
  }, [sessionID, isAdmin, navigate, onMessage]); // Re-run effect only when sessionID changes

  const disconnectWS = useCallback(() => {
    wsManager.disconnect();
    setSendMessage(null);
    currentSessionID.current = null;
  }, []);

  return { sendMessage, disconnectWS };
};

export default useWebSocket;

import { NavigateFunction } from "react-router-dom";
import { SERVER_URL_WEBSOCKET } from "../../config";

class WebSocketManager {
  private ws: WebSocket | null = null;
  private listeners: Set<(data: string) => void> = new Set();
  private sessionID: string | null = null;
  private authToken: string | null = null;
  private serverUrl: string;
  private navigate: NavigateFunction | null = null;

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
  }

  setNavigate(navigate: NavigateFunction) {
    this.navigate = navigate;
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  connect(
    sessionID: string,
    isAdmin = false,
    authToken?: string,
    isReconnect = false,
  ) {
    if (!isReconnect && this.ws && this.sessionID === sessionID) {
      console.log("WebSocket is already connected.");
      return;
    }

    this.sessionID = sessionID;
    this.authToken = authToken || null;

    // Include the authorization token conditionally as a query parameter
    const url = new URL(`${this.serverUrl}/chat/${sessionID}`);
    url.searchParams.append("is_admin", String(isAdmin));
    if (authToken) {
      url.searchParams.append("auth_token", authToken);
    }

    this.ws = new WebSocket(url.toString());

    this.ws.onopen = () => {
      console.log("WebSocket connected.");
    };

    this.ws.onmessage = (event) => {
      this.listeners.forEach((listener) => listener(event.data));
    };

    this.ws.onclose = (event) => {
      console.warn(
        `WebSocket closed: code=${event.code}, reason=${event.reason}`,
      );

      if (event.code !== 1000) {
        console.log("Attempting reconnect...");
        setTimeout(() => this.reconnect(), 2000);
      }
    };
  }

  sendMessage(message: string, retryCount = 3, delay = 1000) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else if (retryCount > 0) {
      console.warn(
        `WebSocket is not open. Retrying in ${delay}ms... (${retryCount} retries left)`,
      );
      setTimeout(() => {
        if (!this.isConnected() && this.sessionID) {
          console.warn("WebSocket is still not open. Retrying...");
          // this.reconnect();
          this.connect(
            this.sessionID,
            false,
            this.authToken || undefined,
            true,
          );
        }
        console.log("Retrying...");
        this.sendMessage(message, retryCount - 1, delay);
      }, delay);
    } else {
      console.error(
        "WebSocket is not open. Cannot send message after retries.",
      );
    }
  }

  addMessageListener(listener: (data: string) => void) {
    this.listeners.add(listener);
  }

  removeMessageListener(listener: (data: string) => void) {
    this.listeners.delete(listener);
  }

  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  disconnect() {
    if (this.ws) {
      console.log("Disconnecting WebSocket...");
      this.ws.close();
      this.ws = null;
      this.sessionID = null;
    }
  }

  private reconnect() {
    if (this.sessionID) {
      this.connect(this.sessionID);
    }
  }
}

const wsManager = new WebSocketManager(SERVER_URL_WEBSOCKET);

export default wsManager;

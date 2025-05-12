import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "").trim() || "http://localhost:8080";
let stompClient = null;

console.log("🌐 WebSocket will connect to:", `${API_BASE_URL}/ws`);

export const connectWebSocket = (username, onConnected, onMessageReceived, onError) => {
  if (stompClient) {
    console.log("🔄 Disconnecting existing WebSocket connection");
    disconnectWebSocket();
  }

  const socket = new SockJS(`${API_BASE_URL}/ws`);
  console.log("✅ SockJS connecting to:", `${API_BASE_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log("🔍 STOMP Debug:", str);
    },
    onConnect: () => {
      console.log("✅ WebSocket connected!");
      console.log("📩 Subscribing to:", `/user/${username}/queue/messages`);
      stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
        console.log("📨 Received message:", message);
        try {
          const parsed = JSON.parse(message.body);
          if (parsed && parsed.content) {
            onMessageReceived(message);
          } else {
            console.warn("⚠️ Received message with invalid format:", parsed);
          }
        } catch (err) {
          console.error("❌ Failed to parse message:", err);
          onError?.(err);
        }
      });
      onConnected?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
      onError?.(frame);
    },
    onWebSocketClose: () => {
      console.log("🔌 WebSocket connection closed");
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
      onError?.(event);
    }
  });

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("🔌 WebSocket disconnected");
  }
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    try {
      stompClient.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(message),
      });
      console.log("📤 Sent message:", message);
      return true;
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      return false;
    }
  } else {
    console.warn("❌ Cannot send, not connected");
    return false;
  }
};


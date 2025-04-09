import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "").trim() || "http://localhost:8080";
let stompClient = null;

console.log("🌐 WebSocket will connect to:", `${API_BASE_URL}/ws`);

export const connectWebSocket = (username, onConnected, onMessageReceived, onError) => {
  const socket = new SockJS(`${API_BASE_URL}/ws`);
  console.log("✅ SockJS connecting to:", `${API_BASE_URL}/ws`);

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log("✅ WebSocket connected!");
      stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
      onConnected?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
      console.error("Details:", frame.body);
      onError?.(frame);
    },
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
    stompClient.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(message),
    });
    console.log("📤 Sent message:", message);
  } else {
    console.warn("❌ Cannot send, not connected");
  }
};


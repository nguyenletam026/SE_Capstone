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
      
      // Subscribe to messages
      console.log("📩 Subscribing to:", `/user/${username}/queue/messages`);
      stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
        console.log("📨 Received message:", message);
        try {
          const parsed = JSON.parse(message.body);
          
          // Ensure message has a unique ID
          if (parsed) {
            if (!parsed.id) {
              parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              message.body = JSON.stringify(parsed);
            }
            
            if (parsed.content) {
              onMessageReceived(message);
            }
          }
        } catch (err) {
          console.error("❌ Failed to parse message:", err);
          onError?.(err);
        }
      });
      
      // Subscribe to notifications
      console.log("🔔 Subscribing to:", `/user/${username}/queue/notifications`);
      stompClient.subscribe(`/user/${username}/queue/notifications`, (notification) => {
        console.log("🔔 Received notification:", notification);
        try {
          const parsed = JSON.parse(notification.body);
          
          // Ensure notification has a unique ID
          if (parsed && !parsed.id) {
            parsed.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            notification.body = JSON.stringify(parsed);
          }
          
          onMessageReceived(notification);
        } catch (err) {
          console.error("❌ Failed to parse notification:", err);
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
      // Ensure message has an ID before sending
      if (message && !message.id) {
        message.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
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


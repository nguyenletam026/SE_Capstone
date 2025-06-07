import { Client } from "@stomp/stompjs";

// Use environment variable for API URL, fallback to production URL
const API_BASE_URL = process.env.REACT_APP_API_URL?.trim() || "https://stressbackend.shop";

// Convert to WebSocket URL
const getWebSocketUrl = () => {
  // For production site stresshelper.store, always use WSS
  if (window.location.hostname === 'stresshelper.store') {
    return 'wss://stressbackend.shop/ws/websocket';
  }
  
  // For other environments, use the API URL with adjusted protocol
  try {
    // Parse the API URL
    const apiUrl = new URL(API_BASE_URL);
    
    // Convert http: to ws: and https: to wss:
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${apiUrl.host}/ws/websocket`;
  } catch (error) {
    console.error("Failed to parse API URL:", error);
    // Fallback to WSS for safety
    return 'wss://stressbackend.shop/ws/websocket';
  }
};

const WS_BASE_URL = getWebSocketUrl();

let stompClient = null;
// Store callback handlers for messages and notifications
const messageHandlers = [];
const notificationHandlers = [];

// Log the API_BASE_URL to confirm the correct value
console.log("🌐 API_BASE_URL set to:", API_BASE_URL);
console.log("🌐 WebSocket will connect to:", `${WS_BASE_URL}/ws`);
console.log("🌐 Page protocol:", window.location.protocol);
console.log("🌐 Page hostname:", window.location.hostname);

export const connectWebSocket = (username, onConnected, onMessageReceived, onError) => {
  // Register message handler
  registerHandler(messageHandlers, onMessageReceived);

  // Check if already connected
  if (stompClient && stompClient.connected) {
    console.log("✅ WebSocket already connected, skipping reconnect");
    onConnected?.();
    return;
  }

  // Disconnect existing connection if present
  if (stompClient) {
    console.log("🔄 Disconnecting existing WebSocket connection");
    disconnectWebSocket();
  }

  // Use native WebSocket instead of SockJS to avoid security issues
  console.log("✅ Attempting WebSocket connection to:", WS_BASE_URL);
  
  // Initialize STOMP client with direct WebSocket connection
  stompClient = new Client({
    brokerURL: WS_BASE_URL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log("🔍 STOMP Debug:", str);
    },
    onConnect: () => {
      console.log("✅ WebSocket connected!");

      // Subscribe to user-specific message queue
      console.log("📩 Subscribing to:", `/user/${username}/queue/messages`);
      stompClient.subscribe(`/user/${username}/queue/messages`, (message) => {
        console.log("📨 Received message:", message);
        try {
          const parsed = JSON.parse(message.body);
          
          // Ensure message has a unique ID
          if (parsed && !parsed.id) {
            parsed.id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          // Process messages with content or imageUrl
          if (parsed.content || parsed.imageUrl) {
            notifyHandlers(messageHandlers, { ...message, parsedBody: parsed });
          }
        } catch (err) {
          console.error("❌ Failed to parse message:", err);
          onError?.(err);
        }
      });

      // Subscribe to user-specific notification queue
      console.log("🔔 Subscribing to:", `/user/${username}/queue/notifications`);
      stompClient.subscribe(`/user/${username}/queue/notifications`, (notification) => {
        console.log("🔔 Received notification:", notification);
        try {
          const parsed = JSON.parse(notification.body);
          
          // Ensure notification has a unique ID
          if (parsed && !parsed.id) {
            parsed.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
          
          notifyHandlers(notificationHandlers, { ...notification, parsedBody: parsed });
        } catch (err) {
          console.error("❌ Failed to parse notification:", err);
          onError?.(err);
        }
      });

      onConnected?.();
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"], frame.body);
      onError?.(frame);
    },
    onWebSocketClose: () => {
      console.log("🔌 WebSocket connection closed");
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
      // Try a fallback URL if there's an error with the main one
      if (window.location.hostname === 'stresshelper.store') {
        console.log("⚠️ Trying fallback connection method...");
      }
      onError?.(event);
    }
  });

  // Activate the STOMP client
  stompClient.activate();
};

// Register a new handler to the list
const registerHandler = (handlersList, handler) => {
  if (handler && typeof handler === 'function' && !handlersList.includes(handler)) {
    handlersList.push(handler);
    console.log(`✅ Handler registered. Total handlers: ${handlersList.length}`);
  }
};

// Notify all registered handlers
const notifyHandlers = (handlersList, data) => {
  console.log(`🔔 Notifying ${handlersList.length} handlers...`);
  
  handlersList.forEach((handler, index) => {
    try {
      console.log(`🔔 Calling handler #${index + 1}`);
      handler(data);
    } catch (error) {
      console.error(`❌ Error in handler #${index + 1}:`, error);
    }
  });
};

// Register notification handler
export const registerNotificationHandler = (handler) => {
  console.log("🔔 Registering new notification handler");
  registerHandler(notificationHandlers, handler);
  console.log(`📊 Currently ${notificationHandlers.length} notification handlers`);
};

// Register message handler
export const registerMessageHandler = (handler) => {
  registerHandler(messageHandlers, handler);
};

// Unregister handler
export const unregisterHandler = (handlersList, handler) => {
  const index = handlersList.indexOf(handler);
  if (index !== -1) {
    handlersList.splice(index, 1);
  }
};

// Disconnect WebSocket
export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("🔌 WebSocket disconnected");
  }
};

// Send a message
export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    try {
      // Ensure message has an ID
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
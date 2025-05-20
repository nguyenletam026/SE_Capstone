import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = (process.env.REACT_APP_API_URL || "").trim() || "http://localhost:8080";
let stompClient = null;
// Lưu trữ danh sách các callback handler cho tin nhắn và thông báo
const messageHandlers = [];
const notificationHandlers = [];

console.log("🌐 WebSocket will connect to:", `${API_BASE_URL}/ws`);

export const connectWebSocket = (username, onConnected, onMessageReceived, onError) => {
  // Đăng ký handler cho tin nhắn và thông báo
  registerHandler(messageHandlers, onMessageReceived);

  // Kiểm tra xem đã có kết nối hay chưa
  if (stompClient && stompClient.connected) {
    console.log("✅ WebSocket đã được kết nối, không cần kết nối lại");
    onConnected?.();
    return;
  }
  
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
              // Không cố gắng sửa đổi thuộc tính body của message
            }
            
            // Process ALL messages including those with imageUrl (not just content)
            if (parsed.content || parsed.imageUrl) {
              // Thông báo cho tất cả các handlers đã đăng ký với đối tượng parsed
              notifyHandlers(messageHandlers, { ...message, parsedBody: parsed });
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
          // Parse the notification body
          const parsed = JSON.parse(notification.body);
          
          // Ensure notification has a unique ID
          if (parsed && !parsed.id) {
            parsed.id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            // Không cố gắng sửa đổi thuộc tính body của notification
            // Thay vào đó, truyền đối tượng parsed vào handlers
          }
          
          // Thông báo cho tất cả các handlers đã đăng ký với đối tượng parsed
          notifyHandlers(notificationHandlers, { ...notification, parsedBody: parsed });
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

// Hàm đăng ký một handler mới vào danh sách
const registerHandler = (handlersList, handler) => {
  if (handler && typeof handler === 'function' && !handlersList.includes(handler)) {
    handlersList.push(handler);
    console.log(`✅ Handler đã được đăng ký. Tổng số handlers: ${handlersList.length}`);
  }
};

// Hàm thông báo cho tất cả các handlers
const notifyHandlers = (handlersList, data) => {
  console.log(`🔔 Đang thông báo cho ${handlersList.length} handlers...`);
  
  handlersList.forEach((handler, index) => {
    try {
      console.log(`🔔 Gọi handler #${index + 1}`);
      handler(data);
    } catch (error) {
      console.error(`❌ Lỗi trong handler #${index + 1}:`, error);
    }
  });
};

// Đăng ký riêng handler cho thông báo
export const registerNotificationHandler = (handler) => {
  console.log("🔔 Đăng ký notification handler mới");
  registerHandler(notificationHandlers, handler);
  console.log(`📊 Hiện có ${notificationHandlers.length} notification handlers`);
};

// Đăng ký riêng handler cho tin nhắn
export const registerMessageHandler = (handler) => {
  registerHandler(messageHandlers, handler);
};

// Hủy đăng ký handler
export const unregisterHandler = (handlersList, handler) => {
  const index = handlersList.indexOf(handler);
  if (index !== -1) {
    handlersList.splice(index, 1);
  }
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


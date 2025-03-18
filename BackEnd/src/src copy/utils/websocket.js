import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let connectedCallback = null;
let messageCallback = null;
let errorCallback = null;
let currentUsername = null;

export const connectWebSocket = (username, onConnected, onMessageReceived, onError) => {
  currentUsername = username;
  connectedCallback = onConnected;
  messageCallback = onMessageReceived;
  errorCallback = onError;
  
  if (stompClient !== null) {
    disconnectWebSocket();
  }

  const socket = new SockJS('http://localhost:8080/ws');
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompClient.onConnect = (frame) => {
    console.log('WebSocket Connected: ' + frame);
    
    // Đăng ký kênh riêng cho người dùng để nhận tin nhắn
    stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
    
    // Trigger callback sau khi kết nối thành công
    if (connectedCallback) {
      connectedCallback();
    }
  };

  stompClient.onStompError = (frame) => {
    console.error('STOMP Error: ' + frame.headers['message']);
    console.error('Additional details: ' + frame.body);
    if (errorCallback) {
      errorCallback(frame);
    }
  };

  stompClient.activate();
};

export const disconnectWebSocket = () => {
  if (stompClient !== null) {
    stompClient.deactivate();
    stompClient = null;
    console.log('WebSocket Disconnected');
  }
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(message),
    });
    return true;
  }
  return false;
};

export const isConnected = () => {
  return stompClient !== null && stompClient.connected;
};

export const reconnect = () => {
  if (currentUsername && !isConnected()) {
    connectWebSocket(currentUsername, connectedCallback, messageCallback, errorCallback);
  }
};
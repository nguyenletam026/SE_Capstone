package com.capstone.controller;

<<<<<<< HEAD
import com.capstone.entity.ChatMessage;
import com.capstone.entity.ChatNotification;
import com.capstone.service.ChatMessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat API", description = "API for handling chat messages")
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;


    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("Unauthorized access");
        }
        return jwt.getSubject();
    }

//web socket lay tin nhan
    @MessageMapping("/chat")
    public void processMessage(@RequestBody ChatMessage chatMessage) {
        String senderId = getCurrentUserId();
        chatMessage.setSenderId(senderId);

        ChatMessage savedMsg = chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(), "/queue/messages",
                new ChatNotification(
                        String.valueOf(savedMsg.getId()),
                        savedMsg.getSenderId(),
                        savedMsg.getRecipientId(),
                        savedMsg.getContent()
                )
        );
    }

// api gui tin nhan
    @Operation(summary = "Send a chat message via REST API")
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage chatMessage) {
        String senderId = getCurrentUserId();
        chatMessage.setSenderId(senderId);
        ChatMessage savedMessage = chatMessageService.save(chatMessage);

        // Gửi tin nhắn qua WebSocket để real-time notification
        messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipientId(), "/queue/messages",
                new ChatNotification(
                        String.valueOf(savedMessage.getId()),
                        savedMessage.getSenderId(),
                        savedMessage.getRecipientId(),
                        savedMessage.getContent()
                )
        );

        return ResponseEntity.ok(savedMessage);
    }

//lay danh sach tin nhan giua 2 nguoi
    @Operation(summary = "Retrieve chat messages between two users")
    @GetMapping("/messages/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(@PathVariable String recipientId) {
        String senderId = getCurrentUserId();
        return ResponseEntity.ok(chatMessageService.findChatMessages(recipientId));
=======
import com.capstone.dto.response.ChatMessageDTO;
import com.capstone.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void handleWebSocketMessage(@Payload Map<String, Object> chatRequest) {
        String content = (String) chatRequest.get("content");
        String senderId = (chatRequest.get("senderId").toString());
        String receiverId = (chatRequest.get("receiverId").toString());

        chatService.saveMessage(content, senderId, receiverId);
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessageDTO> sendMessage(
            @RequestBody Map<String, String> request) {
        String content = request.get("content");
        String senderId = request.get("senderId");
        String receiverId = request.get("receiverId");

        return ResponseEntity.ok(chatService.saveMessage(content, senderId, receiverId));
    }

    @PostMapping(value = "/message-with-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatMessageDTO> sendMessageWithImage(
            @RequestParam("content") String content,
            @RequestParam("senderId") String senderId,
            @RequestParam("receiverId") String receiverId,
            @RequestPart("image") MultipartFile image) {

        return ResponseEntity.ok(chatService.saveMessageWithImage(content, senderId, receiverId, image));
    }

    @GetMapping("/conversation")
    public ResponseEntity<List<ChatMessageDTO>> getConversation(
            @RequestParam String user1Id,
            @RequestParam String user2Id) {
        return ResponseEntity.ok(chatService.getConversation(user1Id, user2Id));
    }

    @PostMapping("/read")
    public ResponseEntity<List<ChatMessageDTO>> markAsRead(
            @RequestParam String userId,
            @RequestParam String senderId) {
        return ResponseEntity.ok(chatService.markMessagesAsRead(userId, senderId));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<ChatMessageDTO>> getUnreadMessages(
            @RequestParam String userId) {
        return ResponseEntity.ok(chatService.getUnreadMessages(userId));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount(
            @RequestParam String userId) {
        return ResponseEntity.ok(chatService.getUnreadMessageCount(userId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ChatMessageDTO>> getRecentMessages(
            @RequestParam String userId) {
        return ResponseEntity.ok(chatService.getRecentMessages(userId));
>>>>>>> hieuDev
    }
}
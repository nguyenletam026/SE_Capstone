package com.capstone.controller;

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
    }
}
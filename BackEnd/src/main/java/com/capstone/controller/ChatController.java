package com.capstone.controller;

import com.capstone.entity.ChatMessage;
import com.capstone.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Map<String, Object> chatRequest) {
        String content = (String) chatRequest.get("content");
        String senderId = (chatRequest.get("senderId").toString());
        String receiverId = (chatRequest.get("receiverId").toString());

        chatService.saveMessage(content, senderId, receiverId);
    }

    @GetMapping("/conversation")
    public List<ChatMessage> getConversation(
            @RequestParam String user1Id,
            @RequestParam String user2Id) {
        return chatService.getConversation(user1Id, user2Id);
    }

    @PostMapping("/read")
    public List<ChatMessage> markAsRead(
            @RequestParam String userId,
            @RequestParam String senderId) {
        return chatService.markMessagesAsRead(userId, senderId);
    }
}
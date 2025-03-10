package com.capstone.service;

import com.capstone.entity.ChatMessage;
import com.capstone.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;


    private String getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("Unauthorized access");
        }
        return jwt.getSubject();
    }


    @Transactional
    public ChatMessage save(ChatMessage chatMessage) {
        String senderId = getCurrentUserId();
        chatMessage.setSenderId(senderId);

        String chatId = chatRoomService
                .getChatRoomId(senderId, chatMessage.getRecipientId(), true)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        chatMessage.setChatId(chatId);
        chatMessage.setTimestamp(Instant.now());

        return repository.save(chatMessage);
    }


    @Transactional(readOnly = true)
    public List<ChatMessage> findChatMessages(String recipientId) {
        String senderId = getCurrentUserId();
        return chatRoomService.getChatRoomId(senderId, recipientId, false)
                .map(repository::findByChatId)
                .orElseGet(List::of);
    }
}

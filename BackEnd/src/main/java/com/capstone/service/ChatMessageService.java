package com.capstone.service;



import com.capstone.entity.ChatMessage;
import com.capstone.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository repository;
    private final ChatRoomService chatRoomService;

    @Transactional
    public ChatMessage save(ChatMessage chatMessage) {
        var chatId = chatRoomService
                .getChatRoomId(chatMessage.getSenderId(), chatMessage.getRecipientId(), true)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        chatMessage.setChatId(chatId);
        chatMessage.setTimestamp(LocalDateTime.now());
        return repository.save(chatMessage);
    }

    public List<ChatMessage> findChatMessages(String senderId, String recipientId) {
        return chatRoomService.getChatRoomId(senderId, recipientId, false)
                .map(repository::findByChatId)
                .orElseGet(List::of);
    }
}


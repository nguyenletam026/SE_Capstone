package com.capstone.service;

import com.capstone.entity.ChatMessage;
import com.capstone.entity.User;
import com.capstone.repository.ChatMessageRepository;
import com.capstone.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public ChatMessage saveMessage(String content, String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(sender)
                .receiver(receiver)
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Send message to specific user
        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                savedMessage);

        return savedMessage;
    }

    public List<ChatMessage> getConversation(String user1Id, String user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatMessage> sentMessages = chatMessageRepository
                .findBySenderAndReceiverOrderByTimestampDesc(user1, user2);

        List<ChatMessage> receivedMessages = chatMessageRepository
                .findBySenderAndReceiverOrderByTimestampDesc(user2, user1);

        List<ChatMessage> conversation = new ArrayList<>();
        conversation.addAll(sentMessages);
        conversation.addAll(receivedMessages);

        conversation.sort((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()));

        return conversation;
    }

    public List<ChatMessage> markMessagesAsRead(String userId, String senderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        List<ChatMessage> unreadMessages = chatMessageRepository
                .findBySenderAndReceiverOrderByTimestampDesc(sender, user);

        unreadMessages.forEach(message -> {
            message.setRead(true);
            chatMessageRepository.save(message);
        });

        return unreadMessages;
    }
}
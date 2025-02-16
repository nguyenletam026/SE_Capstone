package com.capstone.service;

import com.capstone.entity.ChatMessage;
import com.capstone.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    public ChatMessage saveMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChatHistory(String sender, String receiver) {
        return chatMessageRepository.findBySenderAndReceiverOrderByTimestampAsc(sender, receiver);
    }
}
package com.capstone.mapper;

import com.capstone.dto.response.ChatMessageDTO;
import com.capstone.entity.ChatMessage;
import org.springframework.stereotype.Component;

@Component
public class ChatMessageMapper {

    public ChatMessageDTO toDTO(ChatMessage chatMessage) {
        if (chatMessage == null) {
            return null;
        }

        return ChatMessageDTO.builder()
                .id(chatMessage.getId())
                .content(chatMessage.getContent())
                .senderId(chatMessage.getSender().getId())
                .senderName(chatMessage.getSender().getUsername())
                .senderAvatar(chatMessage.getSender().getAvtUrl())
                .receiverId(chatMessage.getReceiver().getId())
                .receiverName(chatMessage.getReceiver().getUsername())
                .timestamp(chatMessage.getTimestamp())
                .read(chatMessage.isRead())
                .emotionalState(chatMessage.getEmotionalState())
                .imageUrl(chatMessage.getImageUrl())
                .build();
    }
}
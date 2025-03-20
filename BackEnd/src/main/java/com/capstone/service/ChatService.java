package com.capstone.service;

import com.capstone.dto.response.ChatMessageDTO;
import com.capstone.entity.ChatMessage;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.ChatMessageMapper;
import com.capstone.repository.ChatMessageRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageMapper chatMessageMapper;
    private final CloudinaryService cloudinaryService;
    private final RekognitionService rekognitionService;

    public ChatMessageDTO saveMessage(String content, String senderId, String receiverId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(sender)
                .receiver(receiver)
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        ChatMessageDTO messageDTO = chatMessageMapper.toDTO(savedMessage);

        // Gửi tin nhắn đến người nhận cụ thể
        messagingTemplate.convertAndSendToUser(
                receiver.getUsername(),
                "/queue/messages",
                messageDTO);

        log.info("Sent message from {} to {}: {}", sender.getUsername(), receiver.getUsername(),
                content.length() > 50 ? content.substring(0, 47) + "..." : content);

        return messageDTO;
    }

    public ChatMessageDTO saveMessageWithImage(String content, String senderId, String receiverId, MultipartFile image) {
        try {
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            User receiver = userRepository.findById(receiverId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            // Upload hình ảnh lên Cloudinary
            String imageUrl = cloudinaryService.uploadFile(image, senderId);

            // Phân tích cảm xúc nếu có gương mặt trong ảnh
            String emotionalState = null;
            try {
                byte[] imageBytes = image.getBytes();
                emotionalState = rekognitionService.detectStress(imageBytes);
            } catch (Exception e) {
                log.error("Error analyzing image emotions: {}", e.getMessage());
                // Không bắt buộc phải có phân tích cảm xúc
            }

            ChatMessage message = ChatMessage.builder()
                    .content(content)
                    .sender(sender)
                    .receiver(receiver)
                    .timestamp(LocalDateTime.now())
                    .read(false)
                    .emotionalState(emotionalState)
                    .imageUrl(imageUrl)
                    .build();

            ChatMessage savedMessage = chatMessageRepository.save(message);
            ChatMessageDTO messageDTO = chatMessageMapper.toDTO(savedMessage);

            // Gửi tin nhắn đến người nhận cụ thể
            messagingTemplate.convertAndSendToUser(
                    receiver.getUsername(),
                    "/queue/messages",
                    messageDTO);

            return messageDTO;
        } catch (Exception e) {
            log.error("Error saving message with image: {}", e.getMessage());
            throw new AppException(ErrorCode.UNKNOWN_ERROR);
        }
    }

    public List<ChatMessageDTO> getConversation(String user1Id, String user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<ChatMessage> conversation = chatMessageRepository.findConversation(user1, user2);

        return conversation.stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> markMessagesAsRead(String userId, String senderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<ChatMessage> unreadMessages = chatMessageRepository
                .findBySenderAndReceiverOrderByTimestampDesc(sender, user);

        List<ChatMessage> readMessages = new ArrayList<>();

        for (ChatMessage message : unreadMessages) {
            if (!message.isRead()) {
                message.setRead(true);
                readMessages.add(chatMessageRepository.save(message));
            }
        }

        List<ChatMessageDTO> readMessageDTOs = readMessages.stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());

        return readMessageDTOs;
    }

    public List<ChatMessageDTO> getUnreadMessages(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<ChatMessage> unreadMessages = chatMessageRepository
                .findByReceiverAndReadFalseOrderByTimestampDesc(user);

        return unreadMessages.stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadMessageCount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatMessageRepository.countUnreadMessages(user);
    }

    public List<ChatMessageDTO> getRecentMessages(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Lấy danh sách người đã gửi tin nhắn cho user
        List<User> senders = chatMessageRepository.findDistinctSenders(user);

        List<ChatMessageDTO> recentMessages = new ArrayList<>();

        // Với mỗi người gửi, lấy tin nhắn gần nhất
        for (User sender : senders) {
            List<ChatMessage> messages = chatMessageRepository
                    .findBySenderAndReceiverOrderByTimestampDesc(sender, user);

            if (!messages.isEmpty()) {
                recentMessages.add(chatMessageMapper.toDTO(messages.get(0)));
            }
        }

        return recentMessages;
    }
}
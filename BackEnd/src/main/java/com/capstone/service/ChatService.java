package com.capstone.service;

import com.capstone.dto.response.ChatMessageDTO;
import com.capstone.entity.ChatMessage;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.ChatMessageMapper;
import com.capstone.repository.ChatMessageRepository;
import com.capstone.repository.ChatRequestRepository;
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
    private final ChatRequestRepository chatRequestRepository;
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

        // Check if there's an approved chat request
        ChatRequest chatRequest = chatRequestRepository.findByPatientAndDoctorAndStatus(sender, receiver, RequestStatus.APPROVED)
                .orElseGet(() -> chatRequestRepository.findByPatientAndDoctorAndStatus(receiver, sender, RequestStatus.APPROVED)
                        .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED)));

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

            // Check if there's an approved chat request
            ChatRequest chatRequest = chatRequestRepository.findByPatientAndDoctorAndStatus(sender, receiver, RequestStatus.APPROVED)
                    .orElseGet(() -> chatRequestRepository.findByPatientAndDoctorAndStatus(receiver, sender, RequestStatus.APPROVED)
                            .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED)));

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

        // Check if there's an approved chat request
        ChatRequest chatRequest = chatRequestRepository.findByPatientAndDoctorAndStatus(user1, user2, RequestStatus.APPROVED)
                .orElseGet(() -> chatRequestRepository.findByPatientAndDoctorAndStatus(user2, user1, RequestStatus.APPROVED)
                        .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED)));

        return chatMessageRepository.findConversation(user1, user2)
                .stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> markMessagesAsRead(String userId, String senderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<ChatMessage> messages = chatMessageRepository.findByReceiverAndReadFalseOrderByTimestampDesc(user);
        messages.forEach(message -> message.setRead(true));
        chatMessageRepository.saveAll(messages);

        return messages.stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> getUnreadMessages(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return chatMessageRepository.findByReceiverAndReadFalseOrderByTimestampDesc(user)
                .stream()
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

        return chatMessageRepository.findDistinctSenders(user)
                .stream()
                .map(sender -> chatMessageRepository.findBySenderAndReceiverOrderByTimestampDesc(sender, user)
                        .stream()
                        .findFirst()
                        .orElse(null))
                .filter(message -> message != null)
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
    }
}
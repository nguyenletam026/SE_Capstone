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
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final ChatPaymentService chatPaymentService;

    public ChatMessageDTO saveMessage(String content, String senderId, String receiverId) {
        log.info("Saving message from {} to {}", senderId, receiverId);
        
        // Get current authenticated user
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Verify that the sender is the authenticated user
        if (!currentUser.getId().equals(senderId)) {
            log.error("User {} attempted to send message as {}", username, senderId);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền gửi tin nhắn với tư cách người khác");
        }
        
        User sender = currentUser;
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        log.info("Found sender: {} and receiver: {}", sender.getUsername(), receiver.getUsername());

        // Determine who is patient and who is doctor
        User patient, doctor;
        if (sender.getRole().getName().equals("DOCTOR")) {
            doctor = sender;
            patient = receiver;
        } else if (receiver.getRole().getName().equals("DOCTOR")) {
            doctor = receiver;
            patient = sender;
        } else {
            log.error("Neither user is a doctor. Sender role: {}, Receiver role: {}", 
                    sender.getRole().getName(), receiver.getRole().getName());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Không thể tìm thấy bác sĩ trong cuộc trò chuyện");
        }

        // Find any active chat request between patient and doctor
        List<ChatRequest> chatRequests = chatRequestRepository
                .findByPatientAndDoctorAndStatusOrderByCreatedAtDesc(patient, doctor, RequestStatus.APPROVED);
        
        if (chatRequests.isEmpty()) {
            log.error("No approved chat request found between patient {} and doctor {}", 
                    patient.getUsername(), doctor.getUsername());
            throw new AppException(ErrorCode.UNAUTHORIZED, 
                    "Không tìm thấy yêu cầu tư vấn đã được duyệt");
        }
        
        // Check if any chat request has an active payment
        boolean hasActivePayment = false;
        String doctorName = doctor.getFirstName() + " " + doctor.getLastName();
        
        for (ChatRequest chatRequest : chatRequests) {
            if (chatPaymentService.isChatActive(chatRequest)) {
                hasActivePayment = true;
                break;
            }
        }
        
        if (!hasActivePayment) {
            log.error("No active chat payment found for patient {} and doctor {}", 
                    patient.getUsername(), doctor.getUsername());
            throw new AppException(ErrorCode.PAYMENT_REQUIRED, 
                    String.format("Phiên chat với bác sĩ %s đã hết hạn. Vui lòng thanh toán để tiếp tục trò chuyện.", 
                            doctorName));
        }

        ChatMessage message = ChatMessage.builder()
                .content(content)
                .sender(sender)
                .receiver(receiver)
                .timestamp(LocalDateTime.now())
                .read(false)
                .build();

        try {
            ChatMessage savedMessage = chatMessageRepository.save(message);
            ChatMessageDTO messageDTO = chatMessageMapper.toDTO(savedMessage);

            // Send message to specific receiver
            messagingTemplate.convertAndSendToUser(
                    receiver.getUsername(),
                    "/queue/messages",
                    messageDTO);

            log.info("Successfully sent message from {} to {}: {}", 
                    sender.getUsername(), receiver.getUsername(),
                    content.length() > 50 ? content.substring(0, 47) + "..." : content);

            return messageDTO;
        } catch (Exception e) {
            log.error("Error saving message: ", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, 
                    "Không thể gửi tin nhắn. Vui lòng thử lại sau.");
        }
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
            
            // Check if chat payment is active
            if (!chatPaymentService.isChatActive(chatRequest)) {
                throw new AppException(ErrorCode.UNAUTHORIZED, "Chat session has expired. Please make a new payment to continue.");
            }

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
        log.info("Getting conversation between users {} and {}", user1Id, user2Id);
        
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        log.info("Found users: {} and {}", user1.getUsername(), user2.getUsername());

        // Find the most recent approved chat request
        ChatRequest chatRequest = chatRequestRepository
                .findFirstByPatientAndDoctorAndStatusOrderByCreatedAtDesc(user1, user2, RequestStatus.APPROVED)
                .orElseGet(() -> chatRequestRepository
                        .findFirstByPatientAndDoctorAndStatusOrderByCreatedAtDesc(user2, user1, RequestStatus.APPROVED)
                        .orElseThrow(() -> {
                            log.error("No approved chat request found between {} and {}", 
                                    user1.getUsername(), user2.getUsername());
                            return new AppException(ErrorCode.UNAUTHORIZED, 
                                    "Không tìm thấy yêu cầu tư vấn đã được duyệt");
                        }));
        
        log.info("Found approved chat request: {}", chatRequest.getId());
        
        // Add chat expiration info to the result
        List<ChatMessageDTO> messages = chatMessageRepository.findConversation(user1, user2)
                .stream()
                .map(chatMessageMapper::toDTO)
                .collect(Collectors.toList());
        
        chatPaymentService.getChatExpiryTime(chatRequest).ifPresent(expiryTime -> {
            if (!messages.isEmpty()) {
                messages.get(0).setExpiresAt(expiryTime);
                messages.get(0).setExpired(expiryTime.isBefore(LocalDateTime.now()));
                log.info("Chat expiry time set to: {}, expired: {}", 
                        expiryTime, messages.get(0).isExpired());
            }
        });

        return messages;
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
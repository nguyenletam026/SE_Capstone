package com.capstone.repository;

import com.capstone.entity.ChatMessage;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {

    List<ChatMessage> findBySenderAndReceiverOrderByTimestampDesc(User sender, User receiver);

    List<ChatMessage> findByReceiverAndReadFalseOrderByTimestampDesc(User receiver);

    @Query("SELECT m FROM ChatMessage m WHERE " +
            "(m.sender = :user1 AND m.receiver = :user2) OR " +
            "(m.sender = :user2 AND m.receiver = :user1) " +
            "ORDER BY m.timestamp ASC")
    List<ChatMessage> findConversation(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver = :user AND m.read = false")
    long countUnreadMessages(@Param("user") User user);

    @Query("SELECT DISTINCT m.sender FROM ChatMessage m WHERE m.receiver = :user")
    List<User> findDistinctSenders(@Param("user") User user);
    
    @Query("SELECT m FROM ChatMessage m WHERE " +
            "((m.sender.id = :userId1 AND m.receiver.id = :userId2) OR " +
            "(m.sender.id = :userId2 AND m.receiver.id = :userId1)) " +
            "ORDER BY m.timestamp DESC LIMIT 1")
    Optional<ChatMessage> findLastMessageBetweenUsers(@Param("userId1") String userId1, @Param("userId2") String userId2);
      @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.receiver.id = :receiverId AND m.sender.id = :senderId AND m.read = false")
    int countUnreadMessagesFromUser(@Param("receiverId") String receiverId, @Param("senderId") String senderId);
      // Methods for chat history functionality
    @Query("SELECT DISTINCT m.receiver FROM ChatMessage m WHERE m.sender = :user")
    List<User> findDistinctReceiversByUser(@Param("user") User user);
    
    @Query("SELECT DISTINCT m.sender FROM ChatMessage m WHERE m.receiver = :user")
    List<User> findDistinctSendersByUser(@Param("user") User user);
      @Query("SELECT m FROM ChatMessage m WHERE " +
           "((m.sender = :user1 AND m.receiver = :user2) OR " +
           "(m.sender = :user2 AND m.receiver = :user1)) " +
           "ORDER BY m.timestamp DESC")
    Optional<ChatMessage> findTopBySenderAndReceiverOrderByTimestampDesc(@Param("user1") User user1, @Param("user2") User user2);
    
    // Method to check if doctor has responded to patient after payment
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM ChatMessage m " +
           "JOIN ChatPayment cp ON cp.chatRequest.patient = m.receiver AND cp.chatRequest.doctor = m.sender " +
           "WHERE cp.id = :paymentId " +
           "AND m.sender = cp.chatRequest.doctor " +
           "AND m.receiver = cp.chatRequest.patient " +
           "AND m.timestamp > cp.createdAt")
    boolean hasDoctorRespondedAfterPayment(@Param("paymentId") String paymentId);
    
    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "JOIN ChatPayment cp ON cp.chatRequest.patient = m.receiver AND cp.chatRequest.doctor = m.sender " +
           "WHERE cp.id = :paymentId " +
           "AND m.sender = cp.chatRequest.doctor " +
           "AND m.receiver = cp.chatRequest.patient " +
           "AND m.timestamp > cp.createdAt")
    long countDoctorMessagesAfterPayment(@Param("paymentId") String paymentId);
}
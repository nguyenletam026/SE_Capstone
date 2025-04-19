package com.capstone.repository;

import com.capstone.entity.ChatMessage;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {


    List<ChatMessage> findByChatId(String chatId);


    List<ChatMessage> findBySenderIdAndRecipientIdOrderByTimestampDesc(String senderId, String recipientId);


    ChatMessage findTopBySenderIdAndRecipientIdOrderByTimestampDesc(String senderId, String recipientId);
}
=======
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
>>>>>>> hieuDev

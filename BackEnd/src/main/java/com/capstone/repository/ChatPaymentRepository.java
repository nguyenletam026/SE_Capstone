package com.capstone.repository;

import com.capstone.entity.ChatPayment;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatPaymentRepository extends JpaRepository<ChatPayment, String> {
    Optional<ChatPayment> findByChatRequest(ChatRequest chatRequest);
    Optional<ChatPayment> findByChatRequestId(String chatRequestId);
    
    @Query("SELECT cp FROM ChatPayment cp " +
           "JOIN cp.chatRequest cr " +
           "WHERE cr.patient = :patient " +
           "AND cp.expiresAt > :now " +
           "AND cr.status = com.capstone.enums.RequestStatus.APPROVED")
    List<ChatPayment> findByPatientAndExpiresAtGreaterThan(@Param("patient") User patient, @Param("now") LocalDateTime now);
    
    @Query("SELECT cp FROM ChatPayment cp " +
           "JOIN cp.chatRequest cr " +
           "WHERE cr.doctor = :doctor " +
           "AND cp.expiresAt > :now " +
           "AND cr.status = com.capstone.enums.RequestStatus.APPROVED")
    List<ChatPayment> findByDoctorAndExpiresAtGreaterThan(@Param("doctor") User doctor, @Param("now") LocalDateTime now);
      @Query("SELECT CASE WHEN COUNT(cp) > 0 THEN true ELSE false END FROM ChatPayment cp " +
           "WHERE cp.chatRequest = :chatRequest " +
           "AND cp.expiresAt > :now")
    boolean existsByChatRequestAndExpiresAtGreaterThan(@Param("chatRequest") ChatRequest chatRequest, @Param("now") LocalDateTime now);
    
    // Refund related queries
    @Query("SELECT cp FROM ChatPayment cp " +
           "JOIN cp.chatRequest cr " +
           "WHERE cp.refunded = false " +
           "AND cp.createdAt < :timeoutThreshold " +
           "AND cr.status = com.capstone.enums.RequestStatus.APPROVED")
    List<ChatPayment> findPaymentsEligibleForRefund(@Param("timeoutThreshold") LocalDateTime timeoutThreshold);
    
    @Query("SELECT cp FROM ChatPayment cp " +
           "JOIN cp.chatRequest cr " +
           "WHERE cr.patient = :patient " +
           "AND cp.refunded = true " +
           "ORDER BY cp.refundedAt DESC")
    List<ChatPayment> findRefundHistoryByPatient(@Param("patient") User patient);
    
    @Query("SELECT cp FROM ChatPayment cp " +
           "JOIN cp.chatRequest cr " +
           "WHERE cr.doctor = :doctor " +
           "AND cp.refunded = true " +
           "ORDER BY cp.refundedAt DESC")
    List<ChatPayment> findRefundHistoryByDoctor(@Param("doctor") User doctor);
}
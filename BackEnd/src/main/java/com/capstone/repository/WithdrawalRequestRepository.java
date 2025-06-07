package com.capstone.repository;

import com.capstone.entity.User;
import com.capstone.entity.WithdrawalRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, String> {
    
    /**
     * Find all withdrawal requests for a specific doctor
     */
    List<WithdrawalRequest> findByDoctorOrderByCreatedAtDesc(User doctor);
    
    /**
     * Find withdrawal requests by status
     */
    List<WithdrawalRequest> findByStatusOrderByCreatedAtDesc(WithdrawalRequest.WithdrawalStatus status);
    
    /**
     * Find withdrawal requests by doctor and status
     */
    List<WithdrawalRequest> findByDoctorAndStatus(User doctor, WithdrawalRequest.WithdrawalStatus status);
    
    /**
     * Find all withdrawal requests for admin view
     */
    @Query("SELECT wr FROM WithdrawalRequest wr ORDER BY wr.createdAt DESC")
    List<WithdrawalRequest> findAllOrderByCreatedAtDesc();
    
    /**
     * Find pending withdrawal requests that need admin action
     */
    List<WithdrawalRequest> findByStatusAndCreatedAtBefore(WithdrawalRequest.WithdrawalStatus status, LocalDateTime before);
    
    /**
     * Check if doctor has any pending withdrawal requests
     */
    @Query("SELECT COUNT(wr) > 0 FROM WithdrawalRequest wr WHERE wr.doctor = :doctor AND wr.status = 'PENDING'")
    boolean hasPendingWithdrawalRequest(@Param("doctor") User doctor);
    
    /**
     * Get withdrawal requests within date range
     */
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.createdAt BETWEEN :startDate AND :endDate ORDER BY wr.createdAt DESC")
    List<WithdrawalRequest> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
      /**
     * Find recent withdrawal requests for dashboard
     */
    @Query("SELECT wr FROM WithdrawalRequest wr WHERE wr.doctor = :doctor ORDER BY wr.createdAt DESC")
    List<WithdrawalRequest> findRecentByDoctor(@Param("doctor") User doctor);
    
    /**
     * Find withdrawal requests by doctor ordered by requestedAt (for service compatibility)
     */
    List<WithdrawalRequest> findByDoctorOrderByRequestedAtDesc(User doctor);
    
    /**
     * Find withdrawal requests by doctor with pagination
     */
    Page<WithdrawalRequest> findByDoctorOrderByRequestedAtDesc(User doctor, Pageable pageable);
    
    /**
     * Find all withdrawal requests ordered by requestedAt
     */
    @Query("SELECT wr FROM WithdrawalRequest wr ORDER BY wr.requestedAt DESC")
    List<WithdrawalRequest> findAllOrderByRequestedAtDesc();
    
    /**
     * Find all withdrawal requests with pagination
     */
    @Query("SELECT wr FROM WithdrawalRequest wr ORDER BY wr.requestedAt DESC")
    Page<WithdrawalRequest> findAllOrderByRequestedAtDesc(Pageable pageable);
    
    /**
     * Find withdrawal requests by status ordered by requestedAt
     */
    List<WithdrawalRequest> findByStatusOrderByRequestedAtDesc(WithdrawalRequest.WithdrawalStatus status);
    
    /**
     * Calculate total withdrawals by doctor
     */
    @Query("SELECT COALESCE(SUM(wr.amount), 0) FROM WithdrawalRequest wr WHERE wr.doctor = :doctor AND wr.status = 'APPROVED'")
    BigDecimal calculateTotalWithdrawalsByDoctor(@Param("doctor") User doctor);
    
    /**
     * Calculate total requested amount by doctor
     */
    @Query("SELECT COALESCE(SUM(wr.amount), 0) FROM WithdrawalRequest wr WHERE wr.doctor = :doctor")
    BigDecimal calculateTotalRequestedByDoctor(@Param("doctor") User doctor);
    
    /**
     * Count withdrawal requests by doctor and status
     */
    long countByDoctorAndStatus(User doctor, WithdrawalRequest.WithdrawalStatus status);
    
    /**
     * Count withdrawal requests by status
     */
    long countByStatus(WithdrawalRequest.WithdrawalStatus status);
    
    /**
     * Calculate total approved withdrawals
     */
    @Query("SELECT COALESCE(SUM(wr.amount), 0) FROM WithdrawalRequest wr WHERE wr.status = 'APPROVED'")
    BigDecimal calculateTotalApprovedWithdrawals();
    
    /**
     * Calculate total pending withdrawals
     */
    @Query("SELECT COALESCE(SUM(wr.amount), 0) FROM WithdrawalRequest wr WHERE wr.status = 'PENDING'")
    BigDecimal calculateTotalPendingWithdrawals();
}

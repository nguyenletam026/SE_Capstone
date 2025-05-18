package com.capstone.repository;

import com.capstone.entity.PendingDeposit;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface PendingDepositRepository extends JpaRepository<PendingDeposit, String> {
    List<PendingDeposit> findByCompletedFalseAndCreatedAtAfter(Date after);
    Optional<PendingDeposit> findByTransactionContent(String transactionContent);
    
    // Find all deposits for a specific user
    List<PendingDeposit> findByUserOrderByCreatedAtDesc(User user);
    
    // Find all completed deposits for a specific user
    List<PendingDeposit> findByUserAndCompletedTrueOrderByCreatedAtDesc(User user);
    
    // Find all completed deposits (for admin)
    List<PendingDeposit> findByCompletedTrueOrderByCreatedAtDesc();
}

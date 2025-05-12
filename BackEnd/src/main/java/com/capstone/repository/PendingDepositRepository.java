package com.capstone.repository;

import com.capstone.entity.PendingDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface PendingDepositRepository extends JpaRepository<PendingDeposit, String> {
    List<PendingDeposit> findByCompletedFalseAndCreatedAtAfter(Date after);
    Optional<PendingDeposit> findByTransactionContent(String transactionContent);
}

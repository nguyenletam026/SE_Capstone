package com.capstone.controller;

import com.capstone.dto.request.DepositRequest;
import com.capstone.entity.PendingDeposit;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.PendingDepositRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final PendingDepositRepository pendingDepositRepository;
    private final UserRepository userRepository;

    @GetMapping("/balance")
    public ResponseEntity<?> getCurrentBalance() {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        Map<String, Object> result = new HashMap<>();
        result.put("balance", user.getBalance());
        result.put("username", user.getUsername());

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> createDeposit(@RequestBody DepositRequest request) {
        String transactionContent = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PendingDeposit deposit = PendingDeposit.builder()
                .user(user)
                .amount(request.getAmount())
                .transactionContent(transactionContent)
                .createdAt(new Date())
                .completed(false)
                .build();

        pendingDepositRepository.save(deposit);

        Map<String, Object> result = new HashMap<>();
        result.put("transactionContent", transactionContent);
        result.put("amount", request.getAmount());
        result.put("qrImageUrl", generateQrUrl(request.getAmount(), transactionContent));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/status/{transactionContent}")
    public ResponseEntity<?> checkDepositStatus(@PathVariable String transactionContent) {
        var context = SecurityContextHolder.getContext();
        String username = context.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        PendingDeposit deposit = pendingDepositRepository.findByTransactionContent(transactionContent)
                .orElseThrow(() -> new AppException(ErrorCode.DEPOSIT_NOT_FOUND));

        // Kiểm tra xem giao dịch có thuộc về user hiện tại không
        if (!deposit.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("completed", deposit.isCompleted());
        result.put("amount", deposit.getAmount());
        result.put("transactionContent", deposit.getTransactionContent());
        result.put("createdAt", deposit.getCreatedAt());

        return ResponseEntity.ok(result);
    }

    private String generateQrUrl(double amount, String content) {
        return "https://qr.sepay.vn/img?acc=04128789601&bank=tpb&amount=" + (int) amount +
                "&des=" + content + "&template=compact&download=false";
    }
}

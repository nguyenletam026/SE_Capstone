package com.capstone.controller;

import com.capstone.dto.request.PasswordResetConfirmRequest;
import com.capstone.dto.request.PasswordResetRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/reset-request")
    public ApiResponse<String> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());
        passwordResetService.sendPasswordResetEmail(request.getEmail());
        return ApiResponse.<String>builder()
                .result("Password reset email sent successfully")
                .build();
    }

    @PostMapping("/reset-confirm")
    public ApiResponse<String> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequest request) {
        log.info("Password reset confirmation received");
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ApiResponse.<String>builder()
                .result("Password reset successfully")
                .build();
    }

    @GetMapping("/verify-token/{token}")
    public ApiResponse<Boolean> verifyResetToken(@PathVariable String token) {
        log.info("Verifying password reset token");
        boolean isValid = passwordResetService.verifyResetToken(token);
        return ApiResponse.<Boolean>builder()
                .result(isValid)
                .build();
    }
} 
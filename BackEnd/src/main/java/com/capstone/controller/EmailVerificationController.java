package com.capstone.controller;

import com.capstone.dto.request.ResendVerificationRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/verify")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final UserService userService;

    @GetMapping("/{token}")
    public ApiResponse<Boolean> verifyEmail(@PathVariable String token) {
        boolean verified = userService.verifyEmail(token);
        return ApiResponse.<Boolean>builder()
                .result(verified)
                .build();
    }

    @PostMapping("/resend")
    public ApiResponse<String> resendVerificationEmail(@RequestBody ResendVerificationRequest request) {
        userService.resendVerificationEmail(request.getEmail());
        return ApiResponse.<String>builder()
                .result("Verification email sent successfully")
                .build();
    }
} 
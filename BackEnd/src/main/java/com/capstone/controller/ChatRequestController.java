package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.ChatRequestResponse;
import com.capstone.entity.ChatRequest;
import com.capstone.service.ChatRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-requests")
@RequiredArgsConstructor
public class ChatRequestController {
    private final ChatRequestService chatRequestService;

    @PostMapping("/{doctorId}")
    public ApiResponse<ChatRequest> createChatRequest(@PathVariable String doctorId) {
        return ApiResponse.<ChatRequest>builder()
                .result(chatRequestService.createChatRequest(doctorId))
                .build();
    }

    @PostMapping("/{requestId}/accept")
    public ApiResponse<ChatRequest> acceptChatRequest(@PathVariable String requestId) {
        return ApiResponse.<ChatRequest>builder()
                .result(chatRequestService.acceptChatRequest(requestId))
                .build();
    }

    @PostMapping("/{requestId}/reject")
    public ApiResponse<ChatRequest> rejectChatRequest(@PathVariable String requestId) {
        return ApiResponse.<ChatRequest>builder()
                .result(chatRequestService.rejectChatRequest(requestId))
                .build();
    }

    @GetMapping("/pending")
    public ApiResponse<List<ChatRequestResponse>> getPendingRequests() {
        return ApiResponse.<List<ChatRequestResponse>>builder()
                .result(chatRequestService.getPendingRequests())
                .build();
    }

    @GetMapping("/my-requests")
    public ApiResponse<List<ChatRequestResponse>> getMyRequests() {
        return ApiResponse.<List<ChatRequestResponse>>builder()
                .result(chatRequestService.getMyRequests())
                .build();
    }

    @GetMapping("/accepted")
    public ApiResponse<List<ChatRequestResponse>> getAcceptedRequests() {
        return ApiResponse.<List<ChatRequestResponse>>builder()
                .result(chatRequestService.getAcceptedRequests())
                .build();
    }

    @GetMapping("/user/accepted")
    public ApiResponse<List<ChatRequestResponse>> getUserAcceptedRequests() {
        return ApiResponse.<List<ChatRequestResponse>>builder()
                .result(chatRequestService.getUserAcceptedRequests())
                .build();
    }
} 
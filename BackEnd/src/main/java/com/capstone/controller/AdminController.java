package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.dto.response.SystemConfigResponse;
import com.capstone.entity.SystemConfig;
import com.capstone.entity.User;
import com.capstone.service.ClassRoomService;
import com.capstone.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final ClassRoomService classRoomService;
    private final SystemConfigService systemConfigService;

    @PostMapping("/create-teacher")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> createTeacherAccount(@RequestBody TeacherCreationRequest request) {
        User teacher = classRoomService.createTeacherAccount(
            request.getFirstName(), 
            request.getLastName(), 
            request.getUsername(), 
            request.getPassword()
        );
        
        return ResponseEntity.ok(ApiResponse.success("Teacher account created successfully"));
    }
    
    @GetMapping("/chat-cost")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getChatCost() {
        double chatCost = systemConfigService.getChatCostPerHour();
        return ResponseEntity.ok(ApiResponse.success(chatCost));
    }
    
    @PutMapping("/chat-cost")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> updateChatCost(@RequestBody ChatCostUpdateRequest request) {
        SystemConfig config = systemConfigService.updateChatCostPerHour(request.getCostPerHour());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật giá chat thành công"));
    }
    
    @GetMapping("/system-configs")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> getAllSystemConfigs() {
        List<SystemConfig> configs = systemConfigService.getAllConfigs();
        List<SystemConfigResponse> responses = configs.stream()
            .map(SystemConfigResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @Data
    public static class TeacherCreationRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String password;
    }
    
    @Data
    public static class ChatCostUpdateRequest {
        private double costPerHour;
    }
} 
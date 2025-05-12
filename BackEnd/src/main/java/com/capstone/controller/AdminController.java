package com.capstone.controller;

import com.capstone.dto.ApiResponse;
import com.capstone.entity.User;
import com.capstone.service.ClassRoomService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final ClassRoomService classRoomService;

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
    
    @Data
    public static class TeacherCreationRequest {
        private String firstName;
        private String lastName;
        private String username;
        private String password;
    }
} 
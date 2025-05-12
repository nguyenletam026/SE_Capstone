package com.capstone.controller;

import com.capstone.dto.request.UserChangePasswordRequest;
import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.UserRepository;
import com.capstone.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ApiResponse<String> createUser(@RequestPart("request") UserCreationRequest request,
                                   @RequestPart(value = "avtFile", required = false) MultipartFile avtFile) throws IOException {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);
        userService.createUser(request, avtFile);
        return ApiResponse.<String>builder()
                .result("User create successful")
                .build();
    }
    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }
    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUser())
                .build();
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    ApiResponse<UserResponse> getUserById(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .build();
    }

    @PutMapping("/{userId}")
    ApiResponse<String> updateUser(@PathVariable("userId") String userId,
                                   @RequestBody UserUpdateRequest request) {
        userService.updateUser(userId, request);
        return ApiResponse.<String>builder()
                .result("User update successful")
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") String userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder()
                .result("User delete successful")
                .build();
    }

    @PostMapping("/change-password")
    ApiResponse<String> changePassword(@RequestBody UserChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<String>builder()
                .result("Password change successful")
                .build();
    }

    @GetMapping("/teachers")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    ApiResponse<List<UserResponse>> getAllTeachers() {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllTeacher())
                .build();
    }
}
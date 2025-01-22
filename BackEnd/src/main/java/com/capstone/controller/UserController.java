package com.capstone.controller;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.UserRepository;
import com.capstone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    ApiResponse<String> createUser (@RequestBody @Valid UserCreationRequest request){
        if(userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        userService.createUser(request);
        return ApiResponse.<String>builder()
                .result("User create successful")
                .build();

    }
    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers(){
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUser())
                .build();
    }



    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable("userId") String userId){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .build();
    }

    @PutMapping("/{userId}")
    ApiResponse<String> updateUser (@PathVariable("userId") String userId,
                     @RequestBody UserUpdateRequest request){
        userService.updateUser(userId, request);
        return ApiResponse.<String>builder()
                .result("User update successful")
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") String userId){
        userService.deleteUser(userId);
        return ApiResponse.<String>builder()
                .result("User delete successful")
                .build();
    }
    }


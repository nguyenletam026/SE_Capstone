package com.capstone.controller;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
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
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setMessage("User created successfully!");
        return apiResponse;
    }
    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers(){
        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>();
        List<UserResponse> userResponses = userService.getAllUser();
        apiResponse.setResult(userResponses);
        return apiResponse;
    }



    @GetMapping("/{userId}")
    ApiResponse<User> getUserById(@PathVariable("userId") String userId){
        ApiResponse<User> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.getUserById(userId));
        return apiResponse;
    }

    @PutMapping("/{userId}")
    ApiResponse<User> updateUser (@PathVariable("userId") String userId,
                     @RequestBody UserUpdateRequest request){
        ApiResponse<User> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userId, request));
        return apiResponse;
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") String userId){
        ApiResponse<String> apiResponse = new ApiResponse<>();
        userService.deleteUser(userId);
        apiResponse.setResult("User deleted successfully");
        return apiResponse;
    }
    }


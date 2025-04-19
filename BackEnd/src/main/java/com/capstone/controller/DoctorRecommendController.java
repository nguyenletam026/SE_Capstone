package com.capstone.controller;


import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "doctor Recommendations", description = "APIs for managing doctor recommendations")
public class DoctorRecommendController {
    private final UserService userService;
    @GetMapping("/get-all-doctor-recommend")
    public ApiResponse<List<UserResponse>> getAllDoctorRecommendations() {
        return ApiResponse.<List<UserResponse>>builder()
                .message("Doctor recommendations retrieved successfully")
                .result(userService.getAllDoctor())
                .build();

    }
}

package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.AuthenticationResponse;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.service.AuthFaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
public class AuthFaceController {
    private final AuthFaceService authFaceService;

    @PostMapping("/auth-face")
    public ApiResponse<AuthenticationResponse> authFace(
            @RequestParam("username") String username,
            @RequestParam("file_target") MultipartFile fileTarget) {
        try {
            if (fileTarget == null || fileTarget.isEmpty()) {
                throw new AppException(ErrorCode.FILE_NULL);
            }

            var result = authFaceService.compareFaces(username, fileTarget.getBytes());

            return ApiResponse.<AuthenticationResponse>builder()
                    .message("Face authentication completed")
                    .result(result)
                    .build();
        } catch (IOException e) {
            throw new AppException(ErrorCode.FAILED_TO_PROCESS_IMAGE);
        }
    }
}
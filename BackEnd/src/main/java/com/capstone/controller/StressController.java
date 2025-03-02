package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.service.RekognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/stress")
@RequiredArgsConstructor
public class StressController {
    private final RekognitionService rekognitionService;

    @PostMapping("/analyze")
    public ApiResponse<String> analyzeStress(@RequestParam("file") MultipartFile file) {
        try {
            String result = rekognitionService.detectStress(file.getBytes());
            return ApiResponse.<String>builder()
                    .code(HttpStatus.OK.value())
                    .message("Stress analysis completed")
                    .result(result)
                    .build();
        } catch (IOException e) {
            return ApiResponse.<String>builder()
                    .code(HttpStatus.BAD_REQUEST.value())
                    .message("Error processing file: " + e.getMessage())
                    .result(null)
                    .build();
        }
    }
}
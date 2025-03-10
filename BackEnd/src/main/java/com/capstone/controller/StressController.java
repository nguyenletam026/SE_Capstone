package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.entity.StressAnalysis;
import com.capstone.service.RekognitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;

import java.io.IOException;
import java.util.List;

@RestController
@Tag(name = "Stress Analysis", description = "API for stress analysis using facial recognition")
@RequestMapping("/api/stress")
@RequiredArgsConstructor
public class StressController {
    private final RekognitionService rekognitionService;

    @Operation(
            summary = "Analyze stress from facial image",
            description = "Uploads an image file and analyzes the user's stress level."
    )
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> analyzeStress(
            @RequestPart("image") MultipartFile image
    ) {
        try {
            String result = rekognitionService.detectStress(image.getBytes());
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


    @Operation(
            summary = "Retrieve stress analysis history",
            description = "Fetches the user's past stress analysis results."
    )
    @GetMapping("/history")
    public ApiResponse<List<StressAnalysis>> getStressHistory() {
        List<StressAnalysis> history = rekognitionService.getStressHistory();
        return ApiResponse.<List<StressAnalysis>>builder()
                .message("Stress history retrieved")
                .result(history)
                .build();
    }
}

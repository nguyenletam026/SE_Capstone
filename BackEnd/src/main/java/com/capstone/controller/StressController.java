package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.WeeklyStressReportResponse;
import com.capstone.dto.response.MonthlyStressReportResponse;
import com.capstone.dto.response.DailyStressReportResponse;
import com.capstone.dto.response.StressAnalysisResponse;
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
import java.util.Map;
import java.util.stream.Collectors;

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
    public ApiResponse<List<StressAnalysisResponse>> getStressHistory() {
        List<StressAnalysis> history = rekognitionService.getStressHistory();
        List<StressAnalysisResponse> response = history.stream()
                .map(analysis -> StressAnalysisResponse.builder()
                        .id(analysis.getId())
                        .stressScore(analysis.getStressScore())
                        .stressLevel(analysis.getStressLevel())
                        .createdAt(analysis.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.<List<StressAnalysisResponse>>builder()
                .message("Stress history retrieved")
                .result(response)
                .build();
    }

    @Operation(
            summary = "Get stress analysis results by week",
            description = "Fetches the user's stress analysis results grouped by week."
    )
    @GetMapping("/weekly")
    public ApiResponse<List<WeeklyStressReportResponse>> getStressByWeek() {
        Map<String, List<StressAnalysis>> weeklyGroups = rekognitionService.getStressByWeek();
        List<WeeklyStressReportResponse> weeklyResults = weeklyGroups.entrySet().stream()
                .map(entry -> {
                    List<StressAnalysis> analyses = entry.getValue();
                    double avgScore = analyses.stream()
                            .mapToDouble(StressAnalysis::getStressScore)
                            .average()
                            .orElse(0.0);
                    String dominantLevel = rekognitionService.mapStressScoreToLevel(avgScore);
                    
                    List<StressAnalysisResponse> analysisResponses = analyses.stream()
                            .map(analysis -> StressAnalysisResponse.builder()
                                    .id(analysis.getId())
                                    .stressScore(analysis.getStressScore())
                                    .stressLevel(analysis.getStressLevel())
                                    .createdAt(analysis.getCreatedAt())
                                    .build())
                            .collect(Collectors.toList());
                    
                    return WeeklyStressReportResponse.builder()
                            .average_stress_score(avgScore)
                            .dominant_stress_level(dominantLevel)
                            .end_date(analyses.get(0).getCreatedAt())
                            .start_date(analyses.get(analyses.size() - 1).getCreatedAt())
                            .total_analyses(analyses.size())
                            .stress_analyses(analysisResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return ApiResponse.<List<WeeklyStressReportResponse>>builder()
                .message("Weekly stress analysis results retrieved")
                .result(weeklyResults)
                .build();
    }

    @Operation(
            summary = "Get stress analysis results by month",
            description = "Fetches the user's stress analysis results grouped by month."
    )
    @GetMapping("/monthly")
    public ApiResponse<List<MonthlyStressReportResponse>> getStressByMonth() {
        Map<String, List<StressAnalysis>> monthlyGroups = rekognitionService.getStressByMonth();
        List<MonthlyStressReportResponse> monthlyResults = monthlyGroups.entrySet().stream()
                .map(entry -> {
                    List<StressAnalysis> analyses = entry.getValue();
                    double avgScore = analyses.stream()
                            .mapToDouble(StressAnalysis::getStressScore)
                            .average()
                            .orElse(0.0);
                    String dominantLevel = rekognitionService.mapStressScoreToLevel(avgScore);
                    
                    List<StressAnalysisResponse> analysisResponses = analyses.stream()
                            .map(analysis -> StressAnalysisResponse.builder()
                                    .id(analysis.getId())
                                    .stressScore(analysis.getStressScore())
                                    .stressLevel(analysis.getStressLevel())
                                    .createdAt(analysis.getCreatedAt())
                                    .build())
                            .collect(Collectors.toList());
                    
                    return MonthlyStressReportResponse.builder()
                            .average_stress_score(avgScore)
                            .dominant_stress_level(dominantLevel)
                            .end_date(analyses.get(0).getCreatedAt())
                            .start_date(analyses.get(analyses.size() - 1).getCreatedAt())
                            .total_analyses(analyses.size())
                            .stress_analyses(analysisResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return ApiResponse.<List<MonthlyStressReportResponse>>builder()
                .message("Monthly stress analysis results retrieved")
                .result(monthlyResults)
                .build();
    }

    @Operation(
            summary = "Get stress analysis results by day",
            description = "Fetches the user's stress analysis results grouped by day."
    )
    @GetMapping("/daily")
    public ApiResponse<List<DailyStressReportResponse>> getStressByDay() {
        Map<String, List<StressAnalysis>> dailyGroups = rekognitionService.getStressByDay();
        List<DailyStressReportResponse> dailyResults = dailyGroups.values().stream()
                .map(analyses -> {
                    double avgScore = analyses.stream()
                            .mapToDouble(StressAnalysis::getStressScore)
                            .average()
                            .orElse(0.0);
                    String dominantLevel = rekognitionService.mapStressScoreToLevel(avgScore);
                    
                    List<StressAnalysisResponse> analysisResponses = analyses.stream()
                            .map(analysis -> StressAnalysisResponse.builder()
                                    .id(analysis.getId())
                                    .stressScore(analysis.getStressScore())
                                    .stressLevel(analysis.getStressLevel())
                                    .createdAt(analysis.getCreatedAt())
                                    .build())
                            .collect(Collectors.toList());

                    return DailyStressReportResponse.builder()
                            .average_stress_score(avgScore)
                            .dominant_stress_level(dominantLevel)
                            .end_date(analyses.getFirst().getCreatedAt())
                            .start_date(analyses.getLast().getCreatedAt())
                            .total_analyses(analyses.size())
                            .stress_analyses(analysisResponses)
                            .build();
                })
                .collect(Collectors.toList());

        return ApiResponse.<List<DailyStressReportResponse>>builder()
                .message("Daily stress analysis results retrieved")
                .result(dailyResults)
                .build();
    }
}

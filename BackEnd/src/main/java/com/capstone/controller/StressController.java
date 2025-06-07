package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.WeeklyStressReportResponse;
import com.capstone.dto.response.MonthlyStressReportResponse;
import com.capstone.dto.response.DailyStressReportResponse;
import com.capstone.dto.response.StressAnalysisResponse;
import com.capstone.dto.response.StressTrendResponse;
import com.capstone.entity.StressAnalysis;
import com.capstone.service.RekognitionService;
import com.capstone.service.StressTrendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Collections;

@RestController
@Tag(name = "Stress Analysis", description = "API for stress analysis using facial recognition")
@RequestMapping("/api/stress")
@RequiredArgsConstructor
public class StressController {
    private final RekognitionService rekognitionService;
    private final StressTrendService stressTrendService;


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

    @GetMapping("/daily")
    public ApiResponse<List<DailyStressReportResponse>> getStressDaily() {
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
                            .end_date(analyses.get(0).getCreatedAt())
                            .start_date(analyses.get(analyses.size() - 1).getCreatedAt())
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

    @Operation(
            summary = "Analyze stress trends",
            description = "Analyzes stress trends over time and provides insights about stress patterns."
    )
    @GetMapping("/trends")
    public ApiResponse<StressTrendResponse> analyzeStressTrends(
            @RequestParam(defaultValue = "day") String period,
            @RequestParam(defaultValue = "7") int duration
    ) {
        StressTrendResponse trendAnalysis = stressTrendService.analyzeTrend(period, duration);
        return ApiResponse.<StressTrendResponse>builder()
                .message("Stress trend analysis completed")
                .result(trendAnalysis)
                .build();
    }

    @Operation(
            summary = "Get stress analysis for today",
            description = "Fetches the user's stress analysis results for today."
    )
    @GetMapping("/today")
    public ApiResponse<DailyStressReportResponse> getStressForToday() {
        DailyStressReportResponse report = rekognitionService.getStressForToday();
        return ApiResponse.<DailyStressReportResponse>builder()
                .message("Today's stress analysis retrieved")
                .result(report)
                .build();
    }
    
    @Operation(
            summary = "Get recent stress levels for continuous monitoring",
            description = "Returns the most recent stress analyses for continuous stress monitoring"
    )
    @GetMapping("/monitor")
    public ApiResponse<List<StressAnalysisResponse>> getRecentStressLevels(
            @RequestParam(defaultValue = "5") int count) {
        List<StressAnalysis> recentAnalyses = rekognitionService.getRecentStressAnalyses(count);
        List<StressAnalysisResponse> response = recentAnalyses.stream()
                .map(analysis -> StressAnalysisResponse.builder()
                        .id(analysis.getId())
                        .stressScore(analysis.getStressScore())
                        .stressLevel(analysis.getStressLevel())
                        .createdAt(analysis.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ApiResponse.<List<StressAnalysisResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Recent stress levels retrieved for monitoring")
                .result(response)
                .build();
    }
    
    @Operation(
            summary = "Get stress data for a specific user",
            description = "Fetches stress data for a specific user by user ID"
    )
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_TEACHER')")
    public ApiResponse<Map<String, Object>> getStressDataForUser(@PathVariable String userId) {
        List<StressAnalysis> stressAnalyses = rekognitionService.getStressAnalysesForUser(userId);
        
        // If no stress analyses are found, return empty data
        if (stressAnalyses.isEmpty()) {
            Map<String, Object> emptyData = new HashMap<>();
            emptyData.put("currentLevel", "NO_DATA");
            emptyData.put("weeklyAverage", "NO_DATA");
            emptyData.put("trend", "stable");
            emptyData.put("history", Collections.emptyList());
            
            Map<String, String> emptyRecommendations = new HashMap<>();
            emptyRecommendations.put("comment", "No stress data available for this user");
            emptyRecommendations.put("advice", "No recommendations available");
            
            emptyData.put("recommendations", emptyRecommendations);
            
            return ApiResponse.<Map<String, Object>>builder()
                    .message("No stress data found for user")
                    .result(emptyData)
                    .build();
        }
        
        // Calculate current level (most recent)
        StressAnalysis mostRecent = stressAnalyses.get(0);
        String currentLevel = mostRecent.getStressLevel();
        
        // Calculate weekly average
        List<StressAnalysis> weeklyAnalyses = stressAnalyses.stream()
                .filter(analysis -> {
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime sevenDaysAgo = now.minusDays(7);
                    Date analysisDate = analysis.getCreatedAt();
                    LocalDateTime analysisDateTime = analysisDate.toInstant()
                            .atZone(ZoneId.systemDefault())
                            .toLocalDateTime();
                    return analysisDateTime.isAfter(sevenDaysAgo);
                })
                .toList();
        
        String weeklyAverage = "NO_DATA";
        if (!weeklyAnalyses.isEmpty()) {
            double avgScore = weeklyAnalyses.stream()
                    .mapToDouble(StressAnalysis::getStressScore)
                    .average()
                    .orElse(0.0);
            weeklyAverage = rekognitionService.mapStressScoreToLevel(avgScore);
        }
        
        // Determine trend (simplified)
        String trend = "stable";
        if (weeklyAnalyses.size() >= 3) {
            double firstHalfAvg = weeklyAnalyses.subList(weeklyAnalyses.size()/2, weeklyAnalyses.size()).stream()
                    .mapToDouble(StressAnalysis::getStressScore)
                    .average()
                    .orElse(0.0);
            double secondHalfAvg = weeklyAnalyses.subList(0, weeklyAnalyses.size()/2).stream()
                    .mapToDouble(StressAnalysis::getStressScore)
                    .average()
                    .orElse(0.0);
            
            if (secondHalfAvg - firstHalfAvg > 0.3) {
                trend = "increasing";
            } else if (firstHalfAvg - secondHalfAvg > 0.3) {
                trend = "decreasing";
            }
        }
        
        // Format history
        List<Map<String, Object>> history = stressAnalyses.stream()
                .limit(10) // Most recent 10 entries
                .map(analysis -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("level", analysis.getStressLevel());
                    entry.put("date", analysis.getCreatedAt());
                    entry.put("note", "Stress analysis from facial recognition");
                    return entry;
                })
                .collect(Collectors.toList());
        
        // Generate recommendations based on current level
        Map<String, String> recommendations = generateRecommendations(currentLevel);
        
        // Compile response
        Map<String, Object> result = new HashMap<>();
        result.put("currentLevel", currentLevel);
        result.put("weeklyAverage", weeklyAverage);
        result.put("trend", trend);
        result.put("history", history);
        result.put("recommendations", recommendations);
        
        return ApiResponse.<Map<String, Object>>builder()
                .message("Stress data retrieved for user")
                .result(result)
                .build();
    }
    
    private Map<String, String> generateRecommendations(String stressLevel) {
        String comment;
        String advice;
        
        switch (stressLevel) {
            case "HIGH":
                comment = "The student is showing signs of high stress levels";
                advice = "Consider checking in with the student and offering support resources";
                break;
            case "MEDIUM":
                comment = "The student is experiencing moderate stress levels";
                advice = "Monitor the situation and suggest stress management techniques";
                break;
            case "LOW":
                comment = "The student appears to be managing stress well";
                advice = "Continue to provide a supportive environment";
                break;
            default:
                comment = "Not enough data to assess stress levels";
                advice = "Encourage regular check-ins";
        }
        
        Map<String, String> recommendations = new HashMap<>();
        recommendations.put("comment", comment);
        recommendations.put("advice", advice);
        return recommendations;
    }
}

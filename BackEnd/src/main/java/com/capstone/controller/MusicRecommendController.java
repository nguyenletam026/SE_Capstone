package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.RecommendationResponse;
import com.capstone.entity.MusicRecommend;
import com.capstone.service.MusicRecommendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Music Recommendations", description = "APIs for managing music recommendations")
public class MusicRecommendController {
    private final MusicRecommendService musicRecommendService;

    @PostMapping(value = "/recommend/MILD_STRESS", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload music recommendation for mild stress level")
    public ResponseEntity<MusicRecommend> uploadMusicForMildStress(
            @RequestParam("music") MultipartFile musicFile,
            @RequestParam("name") String musicName) throws IOException {
        MusicRecommend recommendation = musicRecommendService.uploadMusicForStressLevel(
                musicFile, musicName, "MILD_STRESS");
        return ResponseEntity.ok(recommendation);
    }

    @GetMapping("/get-my-recommend")
    @Operation(summary = "Get music recommendations based on user's stress level")
    public ApiResponse<List<RecommendationResponse>> getMyRecommendations() {
        List<RecommendationResponse> recommendations = musicRecommendService.getMusicRecommendationsForUser();
        return ApiResponse.<List<RecommendationResponse>>builder()
                .message("Music recommendations retrieved successfully")
                .result(recommendations)
                .build();
    }
} 
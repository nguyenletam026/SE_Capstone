package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.RecommendationListResponse;
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
import java.util.Map;

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
    public ApiResponse<RecommendationListResponse> getMyRecommendations() {
        RecommendationListResponse response = musicRecommendService.getMusicRecommendationsForUser();
        return ApiResponse.<RecommendationListResponse>builder()
                .result(response)
                .build();
    }

    @GetMapping("/get-all-music-recommend")
    @Operation(summary = "Get all music recommendations")
    public ApiResponse<List<RecommendationResponse>> getAllRecommendations() {
        List<RecommendationResponse> response = musicRecommendService.getAllMusicRecommendations();
        return ApiResponse.<List<RecommendationResponse>>builder()
                .result(response)
                .build();
    }

    @DeleteMapping("/delete-music")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a music recommendation")
    public ResponseEntity<Void> deleteMusic(@RequestBody Map<String, String> request) {
        musicRecommendService.deleteMusic(request.get("musicUrl"));
        return ResponseEntity.ok().build();
    }
} 
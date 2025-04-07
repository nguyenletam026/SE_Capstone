package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.VideoResponse;
import com.capstone.entity.VideoRecommend;
import com.capstone.service.VideoRecommendService;
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
@Tag(name = "Video Recommendations", description = "APIs for managing video recommendations")
public class VideoRecommendController {
    private final VideoRecommendService videoRecommendService;

    @PostMapping(value = "/recommend-video/MODERATE_STRESS", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload video recommendation for mild stress level")
    public ResponseEntity<VideoRecommend> uploadVideoForMildStress(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam("name") String videoName) throws IOException {
        VideoRecommend recommendation = videoRecommendService.uploadVideoForStressLevel(
                videoFile, videoName, "MODERATE_STRESS");
        return ResponseEntity.ok(recommendation);
    }
} 
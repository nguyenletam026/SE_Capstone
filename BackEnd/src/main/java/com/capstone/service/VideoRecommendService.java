package com.capstone.service;

import com.capstone.dto.response.VideoResponse;
import com.capstone.entity.Answer;
import com.capstone.entity.User;
import com.capstone.entity.VideoRecommend;
import com.capstone.enums.StressLevel;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.AnswerRepository;
import com.capstone.repository.UserRepository;
import com.capstone.repository.VideoRecommendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class VideoRecommendService {
    private final VideoRecommendRepository videoRecommendRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final AnswerRepository answerRepository;

    // Định dạng file video được phép upload
    private static final Set<String> ALLOWED_VIDEO_FORMATS = Set.of(
        "video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"
    );

    @Value("${stress.extreme.threshold:85}")
    private double extremeStressThreshold;

    @Value("${stress.high.threshold:70}")
    private double highStressThreshold;

    @Value("${stress.moderate.threshold:50}")
    private double moderateStressThreshold;

    @Value("${stress.mild.threshold:30}")
    private double mildStressThreshold;

    @Value("${stress.normal.threshold:10}")
    private double normalStressThreshold;

    public List<VideoResponse> getAllVideoRecommendations() {
        List<VideoRecommend> videoRecommends = videoRecommendRepository.findAll();
        return videoRecommends.stream()
                .map(video -> VideoResponse.builder()
                        .videoName(video.getVideoName())
                        .videoUrl(video.getVideoUrl())
                        .build())
                .toList();
    }
    public VideoRecommend uploadVideoForStressLevel(MultipartFile videoFile, String videoName, String stressLevel) throws IOException {
        User currentUser = getCurrentUser();
        
        // Kiểm tra định dạng file
        String contentType = videoFile.getContentType();
        if (contentType == null || !ALLOWED_VIDEO_FORMATS.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }
        
        // Upload video to Cloudinary
        String videoUrl;
        try {
            videoUrl = cloudinaryService.uploadVideo(videoFile);
        } catch (IOException e) {
            log.error("Failed to upload video file: {}", e.getMessage());
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
        }
        
        VideoRecommend videoRecommend = VideoRecommend.builder()
                .videoName(videoName)
                .videoUrl(videoUrl)
                .stressLevel(stressLevel)
                .createdBy(currentUser)
                .createdAt(LocalDateTime.now())
                .build();
                
        return videoRecommendRepository.save(videoRecommend);
    }

    public List<VideoResponse> getVideoRecommendationsForUser() {
        User currentUser = getCurrentUser();
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        
        // Get all answers for today
        List<Answer> todayAnswers = answerRepository.findByUserAndCreatedAtAfter(currentUser, startOfDay);
        
        if (todayAnswers.isEmpty()) {
            log.info("No answers found for user {} today", currentUser.getUsername());
            return List.of(); // Return empty list instead of null
        }

        // Calculate average stress score
        double averageStressScore = todayAnswers.stream()
                .mapToDouble(Answer::getStressScore)
                .average()
                .orElse(0.0);

        // Convert average stress score to stress level based on configured thresholds
        String stressLevel;
        if (averageStressScore >= extremeStressThreshold) {
            stressLevel = StressLevel.EXTREME_STRESS.name();
        } else if (averageStressScore >= highStressThreshold) {
            stressLevel = StressLevel.HIGH_STRESS.name();
        } else if (averageStressScore >= moderateStressThreshold) {
            stressLevel = StressLevel.MODERATE_STRESS.name();
        } else if (averageStressScore >= mildStressThreshold) {
            stressLevel = StressLevel.MILD_STRESS.name();
        } else if (averageStressScore >= normalStressThreshold) {
            stressLevel = StressLevel.NORMAL.name();
        } else {
            stressLevel = StressLevel.RELAXED.name();
        }

        if(stressLevel.equals(StressLevel.MODERATE_STRESS.name())){
            log.info("User {} has high stress level: {}, returning all video recommendations", currentUser.getUsername(), stressLevel);
            List<VideoRecommend> allVideos = videoRecommendRepository.findAll();
            List<VideoResponse> allVideoResponse = allVideos.stream()
                    .map(video -> VideoResponse.builder()
                            .videoName(video.getVideoName())
                            .videoUrl(video.getVideoUrl())
                            .build())
                    .toList();

            return allVideoResponse;
        }
        else
            return null;
    }
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public void deleteVideo(String videoUrl) {
        // Find the video by URL and delete it
        VideoRecommend video = videoRecommendRepository.findByVideoUrl(videoUrl)
                .orElseThrow(() -> new AppException(ErrorCode.VIDEO_NOT_FOUND));
        
        videoRecommendRepository.delete(video);
    }
} 
package com.capstone.service;

import com.capstone.dto.response.RecommendationListResponse;
import com.capstone.dto.response.RecommendationResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.Answer;
import com.capstone.entity.MusicRecommend;
import com.capstone.entity.User;
import com.capstone.entity.VideoRecommend;
import com.capstone.enums.StressLevel;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.AnswerRepository;
import com.capstone.repository.MusicRecommendRepository;
import com.capstone.repository.UserRepository;
import com.capstone.repository.QuestionRepository;
import com.capstone.repository.VideoRecommendRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MusicRecommendService {
    private final MusicRecommendRepository musicRecommendRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final AnswerRepository answerRepository;
    private final QuestionAnswerService questionAnswerService;
    private final QuestionRepository questionRepository;
    private final UserService userService;
    private final VideoRecommendRepository videoRecommendRepository;
    // Định dạng file nhạc được phép upload
    private static final Set<String> ALLOWED_MUSIC_FORMATS = Set.of(
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"
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


    public MusicRecommend uploadMusicForStressLevel(MultipartFile musicFile, String musicName, String stressLevel) throws IOException {
        User currentUser = getCurrentUser();
        
        // Kiểm tra định dạng file
        String contentType = musicFile.getContentType();
        if (contentType == null || !ALLOWED_MUSIC_FORMATS.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }
        
        // Upload music to Cloudinary
        String musicUrl;
        try {
            musicUrl = cloudinaryService.uploadMusic(musicFile);
        } catch (IOException e) {
            log.error("Failed to upload music file: {}", e.getMessage());
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
        }
        
        MusicRecommend musicRecommend = MusicRecommend.builder()
                .musicName(musicName)
                .musicUrl(musicUrl)
                .stressLevel(stressLevel)
                .createdBy(currentUser)
                .createdAt(LocalDateTime.now())
                .build();
                
        return musicRecommendRepository.save(musicRecommend);
    }
    public RecommendationListResponse getMusicRecommendationsForUser() {
        User currentUser = getCurrentUser();
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        
        // Get all answers for today
        List<Answer> todayAnswers = answerRepository.findByUserAndCreatedAtAfter(currentUser, startOfDay);
        
        if (todayAnswers.isEmpty()) {
            log.info("No answers found for user {} today", currentUser.getUsername());
            return RecommendationListResponse.builder()
                    .stressLevel("NO_DATA")
                    .recommendationType("NO_DATA")
                    .recommendations(List.of())
                    .build();
        }

        // Calculate average stress score
        double averageStressScore = todayAnswers.stream()
                .mapToDouble(Answer::getStressScore)
                .average()
                .orElse(0.0);

        // Convert average stress score to stress level based on configured thresholds
        String stressLevel;
        String recommendationType;
        
        if (averageStressScore >= extremeStressThreshold) {
            stressLevel = StressLevel.EXTREME_STRESS.name();
            recommendationType = "DOCTOR_ADVISE";
        } else if (averageStressScore >= highStressThreshold) {
            stressLevel = StressLevel.HIGH_STRESS.name();
            recommendationType = "DOCTOR_ADVISE";
        } else if (averageStressScore >= moderateStressThreshold) {
            stressLevel = StressLevel.MODERATE_STRESS.name();
            recommendationType = "YOGA_EXCERSITE";
        } else if (averageStressScore >= mildStressThreshold) {
            stressLevel = StressLevel.MILD_STRESS.name();
            recommendationType = "MUSIC_LISTENING";
        } else if (averageStressScore >= normalStressThreshold) {
            stressLevel = StressLevel.NORMAL.name();
            recommendationType = "MUSIC_LISTENING";
        } else {
            stressLevel = StressLevel.RELAXED.name();
            recommendationType = "MUSIC_LISTENING";
        }

        List<RecommendationResponse> recommendations;
        
        if(stressLevel.equals(StressLevel.MILD_STRESS.name())){
            log.info("User {} has mild stress level: {}, returning all music recommendations", currentUser.getUsername(), stressLevel);
            List<MusicRecommend> allMusic = musicRecommendRepository.findAll();
            recommendations = allMusic.stream()
                    .map(music -> RecommendationResponse.builder()
                            .recommendName(music.getMusicName())
                            .recommendUrl(music.getMusicUrl())
                            .build())
                    .toList();
        }
        else if(stressLevel.equals(StressLevel.MODERATE_STRESS.name())){
            List<VideoRecommend> videoRecommends = videoRecommendRepository.findAll();
            recommendations = videoRecommends.stream()
                    .map(video -> RecommendationResponse.builder()
                            .recommendName(video.getVideoName())
                            .recommendUrl(video.getVideoUrl())
                            .build())
                    .toList();
        }
        else {
            List<UserResponse> userResponse = userService.getAllDoctor();
            recommendations = userResponse.stream()
                    .map(user -> RecommendationResponse.builder()
                            .recommendName(user.getId())
                            .recommendUrl(user.getAvtUrl())
                            .build())
                    .toList();
        }
        
        return RecommendationListResponse.builder()
                .stressLevel(stressLevel)
                .recommendationType(recommendationType)
                .recommendations(recommendations)
                .build();
    }
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
} 
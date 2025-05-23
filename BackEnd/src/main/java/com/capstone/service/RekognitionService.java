package com.capstone.service;

import com.capstone.dto.response.DailyStressReportResponse;
import com.capstone.dto.response.StressAnalysisResponse;
import com.capstone.entity.StressAnalysis;
import com.capstone.entity.User;
import com.capstone.entity.WeeklyStressReport;
import com.capstone.entity.MonthlyStressReport;
import com.capstone.enums.StressLevel;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.StressAnalysisRepository;
import com.capstone.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;

@Slf4j
@Service
public class RekognitionService {
    private final RekognitionClient rekognitionClient;
    private final UserRepository userRepository;
    private final StressAnalysisRepository stressAnalysisRepository;
    private final StressReportService stressReportService;

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

    @Value("${stress.confidence.threshold:50}")
    private float confidenceThreshold;

    public RekognitionService(
            @Value("${aws.access-key}") String accessKey,
            @Value("${aws.secret-key}") String secretKey,
            @Value("${aws.region}") String region,
            UserRepository userRepository,
            StressAnalysisRepository stressAnalysisRepository,
            StressReportService stressReportService) {
        this.userRepository = userRepository;
        this.stressAnalysisRepository = stressAnalysisRepository;
        this.stressReportService = stressReportService;
        rekognitionClient = RekognitionClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public String detectStress(byte[] imageBytes) {
        try {
            // Lấy userId từ SecurityContextHolder
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

            Image image = Image.builder().bytes(SdkBytes.fromByteArray(imageBytes)).build();
            DetectFacesRequest request = DetectFacesRequest.builder()
                    .image(image)
                    .attributes(Attribute.ALL)
                    .build();

            DetectFacesResponse response = rekognitionClient.detectFaces(request);
            log.info(response.toString());
            List<FaceDetail> faces = response.faceDetails();

            if (faces.isEmpty()) {
                log.info("No faces detected in the image.");
                return "No face detected!";
            }

            double totalScore = 0.0;
            for (FaceDetail face : faces) {
                double stressScore = calculateStressScore(face);
                totalScore += stressScore;
                log.info("Stress score for face: {}", stressScore);
            }
            double avgScore = totalScore / faces.size();
            log.info("Average stress score: {}", avgScore);

            String stressLevel = mapStressScoreToLevel(avgScore);

            // Lưu kết quả vào database
            StressAnalysis analysis = StressAnalysis.builder()
                    .user(user)
                    .stressScore(avgScore)
                    .stressLevel(stressLevel)
                    .createdAt(new Date())
                    .build();
            stressAnalysisRepository.save(analysis);

            // Cập nhật báo cáo tuần và tháng
            stressReportService.updateReports(analysis);

            return stressLevel;
        } catch (Exception e) {
            log.error("Error detecting stress: {}", e.getMessage());
            return "Error analyzing stress.";
        }
    }

    private double calculateStressScore(FaceDetail face) {
        double score = 0.0;
        StringBuilder emotionLog = new StringBuilder("Emotion contributions: ");
        for (Emotion emotion : face.emotions()) {
            if (emotion.confidence() < confidenceThreshold) {
                continue;
            }
            String type = emotion.typeAsString();
            float confidence = emotion.confidence();
            double contribution;
            switch (type) {
                case "ANGRY":
                case "FEAR":
                case "DISGUSTED":
                case "SAD":
                    contribution = confidence * 1.0;
                    score += contribution;
                    emotionLog.append(String.format("%s (%.2f * 1.0 = %.2f), ", type, confidence, contribution));
                    break;
                case "CONFUSED":
                case "SURPRISED":
                    contribution = confidence * 0.5;
                    score += contribution;
                    emotionLog.append(String.format("%s (%.2f * 0.5 = %.2f), ", type, confidence, contribution));
                    break;
                case "CALM":
                case "HAPPY":
                    contribution = confidence * -0.3;
                    score += contribution;
                    emotionLog.append(String.format("%s (%.2f * -0.3 = %.2f), ", type, confidence, contribution));
                    break;
            }
        }
        if (emotionLog.length() > "Emotion contributions: ".length()) {
            log.info(emotionLog.substring(0, emotionLog.length() - 2)); // Bỏ dấu ", " cuối
        } else {
            log.info("No emotions above confidence threshold.");
        }

        // Tính điểm từ đặc điểm vật lý
        StringBuilder physicalLog = new StringBuilder("Physical feature contributions: ");
        if (!face.eyesOpen().value()) {
            score += 10;
            physicalLog.append("Eyes closed (+10), ");
            log.info("Eyes closed detected");
        }
        if (face.mouthOpen().value()) {
            score += 5;
            physicalLog.append("Mouth open (+5), ");
            log.info("Mouth open detected");
        }
        if (Math.abs(face.pose().pitch()) > 20 || Math.abs(face.pose().roll()) > 20) {
            score += 5;
            physicalLog.append("Unusual head tilt (+5), ");
            log.info("Unusual head tilt detected");
        }
        if (physicalLog.length() > "Physical feature contributions: ".length()) {
            log.info(physicalLog.substring(0, physicalLog.length() - 2));
        } else {
            log.info("No physical feature contributions.");
        }

        // Tính điểm từ nhăn mặt
        double frownScore = detectFrowning(face);
        if (frownScore > 0) {
            score += frownScore;
            log.info("Possible frowning detected with score: {}", frownScore);
        }

        // Log tổng điểm trước khi giới hạn
        log.info("Total score before capping: {}", score);

        // Giới hạn điểm từ 0 đến 100
        double finalScore = Math.min(Math.max(score, 0), 100);
        if (finalScore != score) {
            log.info("Score capped from {} to {}", score, finalScore);
        }

        return finalScore;
    }

    private double detectFrowning(FaceDetail face) {
        double frownScore = 0.0;
        List<Landmark> landmarks = face.landmarks();

        // Tìm các điểm lông mày và mắt
        float leftBrowY = 0, rightBrowY = 0, leftEyeY = 0, rightEyeY = 0;
        for (Landmark landmark : landmarks) {
            switch (landmark.typeAsString()) {
                case "leftEyeBrowUp":
                    leftBrowY = landmark.y();
                    break;
                case "rightEyeBrowUp":
                    rightBrowY = landmark.y();
                    break;
                case "leftEyeUp":
                    leftEyeY = landmark.y();
                    break;
                case "rightEyeUp":
                    rightEyeY = landmark.y();
                    break;
            }
        }

        // Tính khoảng cách giữa lông mày và mắt
        float leftDistance = leftEyeY - leftBrowY;
        float rightDistance = rightEyeY - rightBrowY;
        StringBuilder frownLog = new StringBuilder("Frowning analysis: ");
        if (leftDistance < 0.03 && rightDistance < 0.03) {
            frownScore += 10;
            frownLog.append("Eyebrow-eye distance small (Left: ").append(String.format("%.5f", leftDistance))
                    .append(", Right: ").append(String.format("%.5f", rightDistance)).append(") -> +10, ");
        }

        // Kết hợp với cảm xúc DISGUSTED hoặc CONFUSED
        for (Emotion emotion : face.emotions()) {
            if (emotion.confidence() >= confidenceThreshold) {
                if ("DISGUSTED".equals(emotion.typeAsString()) || "CONFUSED".equals(emotion.typeAsString())) {
                    frownScore += 5;
                    frownLog.append(String.format("%s (%.2f) -> +5, ", emotion.typeAsString(), emotion.confidence()));
                }
            }
        }

        if (frownLog.length() > "Frowning analysis: ".length()) {
            log.info(frownLog.substring(0, frownLog.length() - 2));
        }

        return frownScore;
    }

    public String mapStressScoreToLevel(double score) {
        if (score >= extremeStressThreshold) {
            return StressLevel.EXTREME_STRESS.toString();
        } else if (score >= highStressThreshold) {
            return StressLevel.HIGH_STRESS.toString();
        } else if (score >= moderateStressThreshold) {
            return StressLevel.MODERATE_STRESS.toString();
        } else if (score >= mildStressThreshold) {
            return StressLevel.MILD_STRESS.toString();
        } else if (score >= normalStressThreshold) {
            return StressLevel.NORMAL.toString();
        } else {
            return StressLevel.RELAXED.toString();
        }
    }

    public List<StressAnalysis> getStressHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<WeeklyStressReport> getWeeklyReports() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return stressReportService.getWeeklyReports(user);
    }

    public List<MonthlyStressReport> getMonthlyReports() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return stressReportService.getMonthlyReports(user);
    }

    public Map<String, List<StressAnalysis>> getStressByWeek() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<StressAnalysis> allResults = stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        
        return allResults.stream()
                .collect(Collectors.groupingBy(
                    analysis -> {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(analysis.getCreatedAt());
                        cal.set(Calendar.DAY_OF_WEEK, cal.getFirstDayOfWeek());
                        return String.format("Week %d, %d", 
                            cal.get(Calendar.WEEK_OF_YEAR),
                            cal.get(Calendar.YEAR));
                    }
                ));
    }

    public Map<String, List<StressAnalysis>> getStressByMonth() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<StressAnalysis> allResults = stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        
        return allResults.stream()
                .collect(Collectors.groupingBy(
                    analysis -> {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(analysis.getCreatedAt());
                        return String.format("%s %d", 
                            cal.getDisplayName(Calendar.MONTH, Calendar.LONG, Locale.getDefault()),
                            cal.get(Calendar.YEAR));
                    }
                ));
    }

    public Map<String, List<StressAnalysis>> getStressByDay() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        List<StressAnalysis> allResults = stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        
        return allResults.stream()
                .collect(Collectors.groupingBy(
                    analysis -> {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(analysis.getCreatedAt());
                        return String.format("%d/%d/%d", 
                            cal.get(Calendar.DAY_OF_MONTH),
                            cal.get(Calendar.MONTH) + 1,
                            cal.get(Calendar.YEAR));
                    }
                ));
    }
    
    public DailyStressReportResponse getStressBySpecificDate(String dateStr) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
            Date date = dateFormat.parse(dateStr);
            
            // Set start time to beginning of day (00:00:00)
            Calendar calStart = Calendar.getInstance();
            calStart.setTime(date);
            calStart.set(Calendar.HOUR_OF_DAY, 0);
            calStart.set(Calendar.MINUTE, 0);
            calStart.set(Calendar.SECOND, 0);
            calStart.set(Calendar.MILLISECOND, 0);
            Date startDate = calStart.getTime();
            
            // Set end time to end of day (23:59:59)
            Calendar calEnd = Calendar.getInstance();
            calEnd.setTime(date);
            calEnd.set(Calendar.HOUR_OF_DAY, 23);
            calEnd.set(Calendar.MINUTE, 59);
            calEnd.set(Calendar.SECOND, 59);
            calEnd.set(Calendar.MILLISECOND, 999);
            Date endDate = calEnd.getTime();
            
            // Get stress analyses for the specified date
            List<StressAnalysis> analyses = stressAnalysisRepository.findByUserAndCreatedAtBetween(user, startDate, endDate);
            
            if (analyses.isEmpty()) {
                return DailyStressReportResponse.builder()
                        .average_stress_score(0.0)
                        .dominant_stress_level("No Data")
                        .start_date(startDate)
                        .end_date(endDate)
                        .total_analyses(0)
                        .stress_analyses(Collections.emptyList())
                        .build();
            }
            
            // Calculate average stress score
            double avgScore = analyses.stream()
                    .mapToDouble(StressAnalysis::getStressScore)
                    .average()
                    .orElse(0.0);
            
            // Determine dominant stress level
            String dominantLevel = mapStressScoreToLevel(avgScore);
            
            // Map to response objects
            List<StressAnalysisResponse> analysisResponses = analyses.stream()
                    .map(analysis -> StressAnalysisResponse.builder()
                            .id(analysis.getId())
                            .stressScore(analysis.getStressScore())
                            .stressLevel(analysis.getStressLevel())
                            .createdAt(analysis.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());
            
            // Build and return the response
            return DailyStressReportResponse.builder()
                    .average_stress_score(avgScore)
                    .dominant_stress_level(dominantLevel)
                    .start_date(startDate)
                    .end_date(endDate)
                    .total_analyses(analyses.size())
                    .stress_analyses(analysisResponses)
                    .build();
            
        } catch (ParseException e) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }

    public DailyStressReportResponse getStressForToday() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Get today's date
        Calendar today = Calendar.getInstance();
        
        // Set start time to beginning of today (00:00:00)
        Calendar calStart = Calendar.getInstance();
        calStart.set(today.get(Calendar.YEAR), today.get(Calendar.MONTH), today.get(Calendar.DAY_OF_MONTH), 0, 0, 0);
        calStart.set(Calendar.MILLISECOND, 0);
        Date startDate = calStart.getTime();
        
        // Set end time to end of today (23:59:59)
        Calendar calEnd = Calendar.getInstance();
        calEnd.set(today.get(Calendar.YEAR), today.get(Calendar.MONTH), today.get(Calendar.DAY_OF_MONTH), 23, 59, 59);
        calEnd.set(Calendar.MILLISECOND, 999);
        Date endDate = calEnd.getTime();
        
        // Get stress analyses for today
        List<StressAnalysis> analyses = stressAnalysisRepository.findByUserAndCreatedAtBetween(user, startDate, endDate);
        
        if (analyses.isEmpty()) {
            return DailyStressReportResponse.builder()
                    .average_stress_score(0.0)
                    .dominant_stress_level("No Data")
                    .start_date(startDate)
                    .end_date(endDate)
                    .total_analyses(0)
                    .stress_analyses(Collections.emptyList())
                    .build();
        }
        
        // Calculate average stress score
        double avgScore = analyses.stream()
                .mapToDouble(StressAnalysis::getStressScore)
                .average()
                .orElse(0.0);
        
        // Determine dominant stress level
        String dominantLevel = mapStressScoreToLevel(avgScore);
        
        // Map to response objects
        List<StressAnalysisResponse> analysisResponses = analyses.stream()
                .map(analysis -> StressAnalysisResponse.builder()
                        .id(analysis.getId())
                        .stressScore(analysis.getStressScore())
                        .stressLevel(analysis.getStressLevel())
                        .createdAt(analysis.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        
        // Build and return the response
        return DailyStressReportResponse.builder()
                .average_stress_score(avgScore)
                .dominant_stress_level(dominantLevel)
                .start_date(startDate)
                .end_date(endDate)
                .total_analyses(analyses.size())
                .stress_analyses(analysisResponses)
                .build();
    }
    
    /**
     * Get most recent stress analyses for a user
     * @param limit Number of recent analyses to retrieve (currently fixed at 5)
     * @return List of most recent stress analyses
     */
    public List<StressAnalysis> getRecentStressAnalyses(int limit) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    public List<StressAnalysis> getStressAnalysesForUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
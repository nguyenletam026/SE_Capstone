package com.capstone.service;

import com.capstone.enums.StressLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;

import java.util.List;

@Slf4j
@Service
public class RekognitionService {
    private final RekognitionClient rekognitionClient;

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
            @Value("${aws.region}") String region) {
        rekognitionClient = RekognitionClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    public String detectStress(byte[] imageBytes) {
        try {
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

            return mapStressScoreToLevel(avgScore);
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

    private String mapStressScoreToLevel(double score) {
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
}
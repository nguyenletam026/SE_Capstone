package com.capstone.service;

import com.capstone.dto.response.AuthenticationResponse;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.CompareFacesRequest;
import software.amazon.awssdk.services.rekognition.model.CompareFacesResponse;
import software.amazon.awssdk.services.rekognition.model.Image;

import java.io.IOException;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthFaceService {
    private final RekognitionClient rekognitionClient;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final AuthenticationService  authenticationService;

    public AuthenticationResponse compareFaces(String username, byte[] targetImageBytes) {
        User user;
        user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        log.info("Compare faces for {}", user.getUsername());
        try {
            String userImageUrl = user.getAvtUrl();
            if (userImageUrl == null || userImageUrl.isEmpty()) {
                throw new AppException(ErrorCode.INVALID_IMAGE_URL);
            }

            byte[] sourceImageBytes = cloudinaryService.downloadFile(userImageUrl);

            Image source = Image.builder()
                    .bytes(SdkBytes.fromByteArray(sourceImageBytes))
                    .build();

            Image target = Image.builder()
                    .bytes(SdkBytes.fromByteArray(targetImageBytes))
                    .build();
            CompareFacesRequest request = CompareFacesRequest.builder()
                    .sourceImage(source)
                    .targetImage(target)
                    .similarityThreshold(90F)
                    .build();

            CompareFacesResponse response = rekognitionClient.compareFaces(request);
            boolean result = !response.faceMatches().isEmpty() &&
                    response.faceMatches().getFirst().similarity() > 90;
            if (result){
                String token = authenticationService.generateToken(user);
                return AuthenticationResponse.builder()
                        .authenticated(true)
                        .token(token)
                        .build();
            }
            return AuthenticationResponse.builder()
                    .authenticated(false)
                    .build();


        } catch (IOException e) {
            log.error("Error downloading image from URL: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FAILED_TO_PROCESS_IMAGE);
        } catch (Exception e) {
            log.error("Error comparing faces: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.FACE_COMPARISON_FAILED);
        }
    }

}
package com.capstone.service;

import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class CccdVerificationService {

    @Value("${fptai.api.key}")
    private String fptApiKey;

    @Value("${fptai.api.url}")
    private String fptApiUrl;

    public void verifyCccd(MultipartFile cccdImage, User user) {
        try {
            byte[] imageBytes = cccdImage.getBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.set("api_key", fptApiKey);
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(imageBytes, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.exchange(
                    fptApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                String nameFromCccd = root.path("data").path("name").asText().toLowerCase().trim();

                String fullNameFromUser = (user.getLastName() + " " + user.getFirstName()).toLowerCase().trim();

                if (!nameFromCccd.equals(fullNameFromUser)) {
                    throw new AppException(ErrorCode.CCCD_NAME_MISMATCH);
                }
            } else {
                throw new AppException(ErrorCode.INVALID_CERTIFICATE);
            }
        } catch (Exception e) {
            log.error("CCCD Verification failed: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_CERTIFICATE);
        }
    }
}
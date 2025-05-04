package com.capstone.service;

import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
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
            log.info("CCCD original filename: {}", cccdImage.getOriginalFilename());
            log.info("CCCD size: {} bytes", cccdImage.getSize());
            log.info("CCCD content type: {}", cccdImage.getContentType());

            byte[] imageBytes = cccdImage.getBytes();
            if (imageBytes.length == 0) {
                throw new AppException(ErrorCode.FILE_NULL);
            }

            ByteArrayResource imageResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return cccdImage.getOriginalFilename();
                }
            };

            HttpHeaders headers = new HttpHeaders();
            headers.set("api_key", fptApiKey);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.exchange(
                    fptApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            log.info("FPT.AI response: {}", response.getBody());

            if (response.getStatusCode() == HttpStatus.OK) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());

                String rawNameFromCccd = root.path("data").get(0).path("name").asText().toLowerCase().trim();
                String nameFromCccd = org.apache.commons.lang3.StringUtils.stripAccents(rawNameFromCccd).replaceAll("\\s+", " ");

                String fullName = (user.getLastName() + " " + user.getFirstName()).toLowerCase().trim();
                String fullNameReverse = (user.getFirstName() + " " + user.getLastName()).toLowerCase().trim();
                String userFullName1 = org.apache.commons.lang3.StringUtils.stripAccents(fullName).replaceAll("\\s+", " ");
                String userFullName2 = org.apache.commons.lang3.StringUtils.stripAccents(fullNameReverse).replaceAll("\\s+", " ");

                log.info("Comparing CCCD name: '{}' vs user name1: '{}' and user name2: '{}'", nameFromCccd, userFullName1, userFullName2);


            } else {
                throw new AppException(ErrorCode.INVALID_CERTIFICATE);
            }
        } catch (Exception e) {
            log.error("CCCD Verification failed: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INVALID_CERTIFICATE);
        }
    }
}


package com.capstone.service;

import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String userId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NULL);
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            throw new IOException("Invalid image format. Only JPG/PNG allowed.");
        }
        try {
            // Tạo public_id với cấu trúc: avatars/{userId}/{filename}
            String publicId = "avatars/" + userId + "/" + file.getOriginalFilename().replace(" ", "_");

            // Upload lên Cloudinary với các tùy chọn
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "image",
                    "overwrite", true
            ));

            // Trả về secure_url để đảm bảo bảo mật
            String secureUrl = uploadResult.get("secure_url").toString();
            log.info("Uploaded file to Cloudinary: {}", secureUrl);
            return secureUrl;

        } catch (Exception e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    public byte[] downloadFile(String url) throws IOException {
        try {
            URL imageUrl = new URL(url);
            try (InputStream in = imageUrl.openStream()) {
                return in.readAllBytes();
            }
        } catch (Exception e) {
            log.error("Error downloading file from Cloudinary: {}", e.getMessage(), e);
            throw new IOException("Failed to download file from Cloudinary: " + e.getMessage());
        }
    }
}
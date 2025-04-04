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
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;
    private static final Set<String> ALLOWED_MUSIC_FORMATS = Set.of(
            "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"
    );
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


    public String uploadMusic(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NULL);
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_MUSIC_FORMATS.contains(contentType.toLowerCase())) {
            log.error("Invalid music format: {}", contentType);
            throw new AppException(ErrorCode.INVALID_FILE_FORMAT);
        }

        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "resource_type", "video", // Cloudinary uses "video" type for audio files
                            "folder", "music"
                    ));
            return (String) uploadResult.get("url");
        } catch (IOException e) {
            log.error("Failed to upload music file to Cloudinary: {}", e.getMessage());
            throw new AppException(ErrorCode.UPLOAD_FILE_FAILED);
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
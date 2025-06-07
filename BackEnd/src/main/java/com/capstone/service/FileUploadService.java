package com.capstone.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    /**
     * Upload file to a specific folder in Cloudinary
     */
    public String uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty or null");
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Upload to Cloudinary
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", folderName + "/" + uniqueFilename,
                    "resource_type", "image",
                    "overwrite", true
            ));

            String secureUrl = uploadResult.get("secure_url").toString();
            log.info("Successfully uploaded file to Cloudinary: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Error uploading file to Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Upload transfer proof image for withdrawal requests
     */
    public String uploadTransferProof(MultipartFile file) {
        return uploadFile(file, "transfer-proofs");
    }

    /**
     * Validate if file is an image
     */
    public boolean isValidImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        return contentType != null && (
            contentType.equals("image/jpeg") ||
            contentType.equals("image/png") ||
            contentType.equals("image/jpg") ||
            contentType.equals("image/gif") ||
            contentType.equals("image/webp")
        );
    }

    /**
     * Validate file size (max 5MB)
     */
    public boolean isValidFileSize(MultipartFile file, long maxSizeInBytes) {
        return file != null && file.getSize() <= maxSizeInBytes;
    }

    /**
     * Delete file from Cloudinary by URL
     */
    public void deleteFile(String fileUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(fileUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Successfully deleted file from Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Error deleting file from Cloudinary: {}", e.getMessage(), e);
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        try {
            // Cloudinary URL format: https://res.cloudinary.com/[cloud_name]/image/upload/[version]/[public_id].[format]
            String[] parts = url.split("/");
            if (parts.length >= 2) {
                String lastPart = parts[parts.length - 1];
                // Remove file extension
                if (lastPart.contains(".")) {
                    lastPart = lastPart.substring(0, lastPart.lastIndexOf("."));
                }
                
                // If there's a folder structure, include it
                if (parts.length >= 3) {
                    String folder = parts[parts.length - 2];
                    return folder + "/" + lastPart;
                }
                
                return lastPart;
            }
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", e.getMessage());
        }
        
        return null;
    }
}

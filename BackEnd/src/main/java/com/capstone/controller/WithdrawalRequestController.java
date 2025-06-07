package com.capstone.controller;

import com.capstone.dto.request.WithdrawalRequestDto;
import com.capstone.dto.response.WithdrawalRequestResponse;
import com.capstone.entity.User;
import com.capstone.entity.WithdrawalRequest;
import com.capstone.service.FileUploadService;
import com.capstone.service.UserService;
import com.capstone.service.WithdrawalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/withdrawal")
@RequiredArgsConstructor
public class WithdrawalRequestController {

    private final WithdrawalRequestService withdrawalRequestService;
    private final UserService userService;
    private final FileUploadService fileUploadService;

    // Doctor endpoints

    /**
     * Create withdrawal request
     */    @PostMapping("/request")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<WithdrawalRequestResponse> createWithdrawalRequest(
            @Valid @RequestBody WithdrawalRequestDto requestDto,
            Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        WithdrawalRequestResponse response = withdrawalRequestService.createWithdrawalRequest(doctor, requestDto);
        return ResponseEntity.ok(response);
    }

    /**
     * Get doctor's withdrawal requests
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<WithdrawalRequestResponse>> getDoctorWithdrawalRequests(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        List<WithdrawalRequestResponse> requests = withdrawalRequestService.getDoctorWithdrawalRequests(doctor);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get doctor's withdrawal requests with pagination
     */
    @GetMapping("/my-requests/paginated")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Page<WithdrawalRequestResponse>> getDoctorWithdrawalRequestsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        Page<WithdrawalRequestResponse> requests = withdrawalRequestService.getDoctorWithdrawalRequestsPaginated(doctor, page, size);
        return ResponseEntity.ok(requests);
    }

    /**
     * Cancel withdrawal request
     */
    @PostMapping("/cancel/{requestId}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<WithdrawalRequestResponse> cancelWithdrawalRequest(
            @PathVariable String requestId,
            Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        WithdrawalRequestResponse response = withdrawalRequestService.cancelWithdrawalRequest(requestId, doctor);
        return ResponseEntity.ok(response);
    }

    /**
     * Get doctor's withdrawal statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Object> getDoctorWithdrawalStats(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        Object stats = withdrawalRequestService.getDoctorWithdrawalStats(doctor);
        return ResponseEntity.ok(stats);
    }

    // Admin endpoints

    /**
     * Get all withdrawal requests for admin
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WithdrawalRequestResponse>> getAllWithdrawalRequests() {
        List<WithdrawalRequestResponse> requests = withdrawalRequestService.getAllWithdrawalRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Get withdrawal requests by status for admin
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<WithdrawalRequestResponse>> getWithdrawalRequestsByStatus(@PathVariable String status) {
        WithdrawalRequest.WithdrawalStatus withdrawalStatus = WithdrawalRequest.WithdrawalStatus.valueOf(status.toUpperCase());
        List<WithdrawalRequestResponse> requests = withdrawalRequestService.getWithdrawalRequestsByStatus(withdrawalStatus);
        return ResponseEntity.ok(requests);
    }

    /**
     * Get withdrawal requests with pagination for admin
     */
    @GetMapping("/admin/all/paginated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<WithdrawalRequestResponse>> getAllWithdrawalRequestsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<WithdrawalRequestResponse> requests = withdrawalRequestService.getAllWithdrawalRequestsPaginated(page, size);
        return ResponseEntity.ok(requests);
    }

    /**
     * Approve withdrawal request with transfer proof
     */    @PostMapping(value = "/admin/approve/{requestId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WithdrawalRequestResponse> approveWithdrawalRequest(
            @PathVariable String requestId,
            @RequestPart(required = false) MultipartFile transferProof,
            @RequestParam(required = false) String adminNote) {
        
        // Validate transfer proof if provided
        if (transferProof != null && !transferProof.isEmpty()) {
            if (!fileUploadService.isValidImage(transferProof)) {
                return ResponseEntity.badRequest().build();
            }
            
            // Validate file size (max 5MB)
            if (!fileUploadService.isValidFileSize(transferProof, 5 * 1024 * 1024)) {
                return ResponseEntity.badRequest().build();
            }
        }
        
        WithdrawalRequestResponse response = withdrawalRequestService.approveWithdrawalRequest(requestId, transferProof, adminNote);
        return ResponseEntity.ok(response);
    }

    /**
     * Reject withdrawal request
     */
    @PostMapping("/admin/reject/{requestId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WithdrawalRequestResponse> rejectWithdrawalRequest(
            @PathVariable String requestId,
            @RequestParam String adminNote) {
        WithdrawalRequestResponse response = withdrawalRequestService.rejectWithdrawalRequest(requestId, adminNote);
        return ResponseEntity.ok(response);
    }

    /**
     * Get admin withdrawal statistics
     */
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getAdminWithdrawalStats() {
        Object stats = withdrawalRequestService.getAdminWithdrawalStats();
        return ResponseEntity.ok(stats);
    }    /**
     * Upload transfer proof file endpoint
     */
    @PostMapping(value = "/admin/upload-proof", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadTransferProof(@RequestPart MultipartFile file) {
        if (!fileUploadService.isValidImage(file)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid image format"));
        }
        
        if (!fileUploadService.isValidFileSize(file, 5 * 1024 * 1024)) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size too large (max 5MB)"));
        }
        
        try {
            String fileUrl = fileUploadService.uploadTransferProof(file);
            Map<String, String> response = new HashMap<>();
            response.put("fileUrl", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file"));
        }
    }

    /**
     * Update transfer proof for existing withdrawal request
     */
    @PostMapping(value = "/admin/update-proof/{requestId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<WithdrawalRequestResponse> updateTransferProof(
            @PathVariable String requestId,
            @RequestPart MultipartFile transferProof) {
        
        // Validate transfer proof
        if (transferProof == null || transferProof.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        if (!fileUploadService.isValidImage(transferProof)) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate file size (max 5MB)
        if (!fileUploadService.isValidFileSize(transferProof, 5 * 1024 * 1024)) {
            return ResponseEntity.badRequest().build();
        }
        
        WithdrawalRequestResponse response = withdrawalRequestService.updateTransferProof(requestId, transferProof);
        return ResponseEntity.ok(response);
    }
}

package com.capstone.controller;


import com.capstone.dto.request.DoctorUpgradeRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.DoctorUpgradeResponse;
import com.capstone.service.DoctorUpgradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorUpgradeController {
    private final DoctorUpgradeService doctorUpgradeService;

    @PostMapping(value = "/request-doctor", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<String> requestDoctorUpgrade(@RequestParam("certificateImage") MultipartFile certificateImage) {
        DoctorUpgradeRequest request = new DoctorUpgradeRequest(certificateImage);
        doctorUpgradeService.requestDoctorUpgrade(request);
        return ApiResponse.<String>builder()
                .result("Doctor upgrade request submitted")
                .build();
    }


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/doctor-requests")
    public ApiResponse<List<DoctorUpgradeResponse>> getAllDoctorRequests() {
        return ApiResponse.<List<DoctorUpgradeResponse>>builder()
                .result(doctorUpgradeService.getAllUpgradeRequests())
                .build();
    }


    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/approve-doctor/{requestId}")
    public ApiResponse<String> approveDoctor(@PathVariable String requestId) {
        doctorUpgradeService.approveDoctorUpgrade(requestId);
        return ApiResponse.<String>builder()
                .result("Doctor upgrade approved")
                .build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/reject-doctor/{requestId}")
    public ApiResponse<String> rejectDoctor(@PathVariable String requestId) {
        doctorUpgradeService.rejectDoctorUpgrade(requestId);
        return ApiResponse.<String>builder()
                .result("Doctor upgrade rejected")
                .build();
    }

    @GetMapping("/doctor-requests/{requestId}/certificate")
    public ResponseEntity<byte[]> getDoctorCertificate(@PathVariable String requestId) {
        byte[] imageData = doctorUpgradeService.getDoctorCertificateImage(requestId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/jpeg")
                .body(imageData);
    }
}

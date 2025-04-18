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

    @PostMapping(
            value = "/request-doctor",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<String> requestDoctorUpgrade(
            @RequestPart("certificateImage") MultipartFile certificateImage,
            @RequestPart("cccdImage") MultipartFile cccdImage,
            @RequestPart("specialization") String specialization,
            @RequestPart("experienceYears") int experienceYears,
            @RequestPart("description") String description,
            @RequestPart("phoneNumber") String phoneNumber,
            @RequestPart("hospital") String hospital) {

        DoctorUpgradeRequest request = DoctorUpgradeRequest.builder()
                .certificateImage(certificateImage)
                .cccdImage(cccdImage)
                .specialization(specialization)
                .experienceYears(experienceYears)
                .description(description)
                .phoneNumber(phoneNumber)
                .hospital(hospital)
                .build();

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

    @GetMapping("/approved-doctors")
    public ApiResponse<List<DoctorUpgradeResponse>> getApprovedDoctors() {
        return ApiResponse.<List<DoctorUpgradeResponse>>builder()
                .result(doctorUpgradeService.getApprovedDoctors())
                .build();
    }

}

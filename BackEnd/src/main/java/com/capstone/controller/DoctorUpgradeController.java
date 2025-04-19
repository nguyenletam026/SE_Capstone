package com.capstone.controller;


import com.capstone.dto.request.DoctorUpgradeRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.DoctorUpgradeResponse;
import com.capstone.service.DoctorUpgradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
<<<<<<< HEAD
=======
import org.springframework.http.MediaType;
>>>>>>> hieuDev
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

<<<<<<< HEAD
    @PostMapping("/request-doctor")
    ApiResponse<String> requestDoctorUpgrade(@RequestParam("certificateImage") MultipartFile certificateImage) {
        DoctorUpgradeRequest request = new DoctorUpgradeRequest(certificateImage);
        doctorUpgradeService.requestDoctorUpgrade(request);
=======
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

>>>>>>> hieuDev
        return ApiResponse.<String>builder()
                .result("Doctor upgrade request submitted")
                .build();
    }

<<<<<<< HEAD
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/doctor-requests")
    ApiResponse<List<DoctorUpgradeResponse>> getAllDoctorRequests() {
=======




    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/doctor-requests")
    public ApiResponse<List<DoctorUpgradeResponse>> getAllDoctorRequests() {
>>>>>>> hieuDev
        return ApiResponse.<List<DoctorUpgradeResponse>>builder()
                .result(doctorUpgradeService.getAllUpgradeRequests())
                .build();
    }

<<<<<<< HEAD
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/approve-doctor/{requestId}")
    ApiResponse<String> approveDoctor(@PathVariable String requestId) {
=======

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/approve-doctor/{requestId}")
    public ApiResponse<String> approveDoctor(@PathVariable String requestId) {
>>>>>>> hieuDev
        doctorUpgradeService.approveDoctorUpgrade(requestId);
        return ApiResponse.<String>builder()
                .result("Doctor upgrade approved")
                .build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/reject-doctor/{requestId}")
<<<<<<< HEAD
    ApiResponse<String> rejectDoctor(@PathVariable String requestId) {
=======
    public ApiResponse<String> rejectDoctor(@PathVariable String requestId) {
>>>>>>> hieuDev
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
<<<<<<< HEAD
=======

    @GetMapping("/approved-doctors")
    public ApiResponse<List<DoctorUpgradeResponse>> getApprovedDoctors() {
        return ApiResponse.<List<DoctorUpgradeResponse>>builder()
                .result(doctorUpgradeService.getApprovedDoctors())
                .build();
    }

>>>>>>> hieuDev
}

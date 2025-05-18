package com.capstone.service;

import com.capstone.dto.request.DoctorUpgradeRequest;
import com.capstone.dto.response.DoctorUpgradeResponse;
import com.capstone.entity.DoctorUpgrade;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.enums.Role;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.DoctorUpgradeRepository;
import com.capstone.repository.RoleRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DoctorUpgradeService {
    private final UserRepository userRepository;
    private final DoctorUpgradeRepository doctorUpgradeRepository;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final CccdVerificationService cccdVerificationService;

    public void requestDoctorUpgrade(DoctorUpgradeRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (user.getRole().getName().equals("DOCTOR")) {
            throw new AppException(ErrorCode.ALREADY_DOCTOR);
        }
        
        // Check if user already has a pending request
        List<DoctorUpgrade> pendingRequests = doctorUpgradeRepository.findByUserAndStatus(user, RequestStatus.PENDING);
        if (!pendingRequests.isEmpty()) {
            throw new AppException(ErrorCode.REQUEST_ALREADY_SENT);
        }

        cccdVerificationService.verifyCccd(request.getCccdImage(), user);

        try {
            String imageUrl = cloudinaryService.uploadFile(request.getCertificateImage(), user.getId());

            DoctorUpgrade upgradeRequest = DoctorUpgrade.builder()
                    .user(user)
                    .certificateUrl(imageUrl)
                    .status(RequestStatus.PENDING)
                    .specialization(request.getSpecialization())
                    .experienceYears(request.getExperienceYears())
                    .description(request.getDescription())
                    .phoneNumber(request.getPhoneNumber())
                    .hospital(request.getHospital())
                    .build();

            doctorUpgradeRepository.save(upgradeRequest);
        } catch (IOException e) {
            throw new RuntimeException("Error uploading certificate image: " + e.getMessage());
        }
    }


    public void approveDoctorUpgrade(String requestId) {
        DoctorUpgrade upgradeRequest = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        upgradeRequest.setStatus(RequestStatus.APPROVED);
        User user = upgradeRequest.getUser();

        com.capstone.entity.Role roleDoctor = roleRepository.findByName("DOCTOR")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        user.setRole(roleDoctor);

        userRepository.save(user);
        doctorUpgradeRepository.save(upgradeRequest);
    }



    public void rejectDoctorUpgrade(String requestId) {
        DoctorUpgrade upgradeRequest = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        upgradeRequest.setStatus(RequestStatus.REJECTED);
        doctorUpgradeRepository.save(upgradeRequest);
    }


    public List<DoctorUpgradeResponse> getAllUpgradeRequests() {
        return doctorUpgradeRepository.findAll().stream()
                .map(req -> DoctorUpgradeResponse.builder()
                        .requestId(req.getId())
                        .username(req.getUser().getUsername())
                        .certificateUrl(req.getCertificateUrl())
                        .status(req.getStatus())
                        .specialization(req.getSpecialization())
                        .experienceYears(req.getExperienceYears())
                        .description(req.getDescription())
                        .phoneNumber(req.getPhoneNumber())
                        .hospital(req.getHospital())
                        .build())
                .collect(Collectors.toList());
    }


    public byte[] getDoctorCertificateImage(String requestId) {
        DoctorUpgrade request = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        try {
            return cloudinaryService.downloadFile(request.getCertificateUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error downloading certificate image: " + e.getMessage());
        }
    }
    
    public boolean currentUserHasPendingRequest() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                
        List<DoctorUpgrade> pendingRequests = doctorUpgradeRepository.findByUserAndStatus(user, RequestStatus.PENDING);
        return !pendingRequests.isEmpty();
    }
}

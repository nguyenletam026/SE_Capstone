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
<<<<<<< HEAD
import org.springframework.web.multipart.MultipartFile;
=======

>>>>>>> hieuDev

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class DoctorUpgradeService {
    private final UserRepository userRepository;
    private final DoctorUpgradeRepository doctorUpgradeRepository;
    private final RoleRepository roleRepository;
<<<<<<< HEAD
=======
    private final CloudinaryService cloudinaryService;
    private final CccdVerificationService cccdVerificationService;
>>>>>>> hieuDev

    public void requestDoctorUpgrade(DoctorUpgradeRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

<<<<<<< HEAD
        if (user.getRole().getName().equals(Role.DOCTOR.name())) {
            throw new AppException(ErrorCode.ALREADY_DOCTOR);
        }

        try {
            byte[] imageData = request.getCertificateImage().getBytes(); // Lưu ảnh dưới dạng byte[]

            DoctorUpgrade upgradeRequest = DoctorUpgrade.builder()
                    .user(user)
                    .certificateImage(imageData)
                    .status(RequestStatus.PENDING)
=======
        if (user.getRole().getName().equals("DOCTOR")) {
            throw new AppException(ErrorCode.ALREADY_DOCTOR);
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
>>>>>>> hieuDev
                    .build();

            doctorUpgradeRepository.save(upgradeRequest);
        } catch (IOException e) {
<<<<<<< HEAD
            throw new RuntimeException("Error saving certificate image", e);
=======
            throw new RuntimeException("Error uploading certificate image: " + e.getMessage());
>>>>>>> hieuDev
        }
    }


    public void approveDoctorUpgrade(String requestId) {
        DoctorUpgrade upgradeRequest = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        upgradeRequest.setStatus(RequestStatus.APPROVED);
        User user = upgradeRequest.getUser();

<<<<<<< HEAD
        com.capstone.entity.Role roleDoctor = roleRepository.findByName(Role.DOCTOR.name())
=======
        com.capstone.entity.Role roleDoctor = roleRepository.findByName("DOCTOR")
>>>>>>> hieuDev
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        user.setRole(roleDoctor);

        userRepository.save(user);
        doctorUpgradeRepository.save(upgradeRequest);
    }


<<<<<<< HEAD
=======

>>>>>>> hieuDev
    public void rejectDoctorUpgrade(String requestId) {
        DoctorUpgrade upgradeRequest = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));

        upgradeRequest.setStatus(RequestStatus.REJECTED);
        doctorUpgradeRepository.save(upgradeRequest);
    }

<<<<<<< HEAD
=======

>>>>>>> hieuDev
    public List<DoctorUpgradeResponse> getAllUpgradeRequests() {
        return doctorUpgradeRepository.findAll().stream()
                .map(req -> DoctorUpgradeResponse.builder()
                        .requestId(req.getId())
                        .username(req.getUser().getUsername())
<<<<<<< HEAD
=======
                        .certificateUrl(req.getCertificateUrl())
                        .specialization(req.getSpecialization())
                        .experienceYears(req.getExperienceYears())
                        .description(req.getDescription())
                        .phoneNumber(req.getPhoneNumber())
                        .hospital(req.getHospital())
>>>>>>> hieuDev
                        .status(req.getStatus())
                        .build())
                .collect(Collectors.toList());
    }


    public byte[] getDoctorCertificateImage(String requestId) {
        DoctorUpgrade request = doctorUpgradeRepository.findById(requestId)
                .orElseThrow(() -> new AppException(ErrorCode.REQUEST_NOT_FOUND));
<<<<<<< HEAD
        return request.getCertificateImage();
    }
=======

        try {
            return cloudinaryService.downloadFile(request.getCertificateUrl());
        } catch (IOException e) {
            throw new RuntimeException("Error downloading certificate image: " + e.getMessage());
        }
    }

    public List<DoctorUpgradeResponse> getApprovedDoctors() {
        return doctorUpgradeRepository.findByStatus(RequestStatus.APPROVED).stream()
                .map(req -> DoctorUpgradeResponse.builder()
                        .requestId(req.getId())
                        .username(req.getUser().getUsername())
                        .certificateUrl(req.getCertificateUrl())
                        .specialization(req.getSpecialization())
                        .experienceYears(req.getExperienceYears())
                        .description(req.getDescription())
                        .phoneNumber(req.getPhoneNumber())
                        .hospital(req.getHospital())
                        .status(req.getStatus())
                        .build())
                .collect(Collectors.toList());
    }


>>>>>>> hieuDev
}

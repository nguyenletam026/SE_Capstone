package com.capstone.repository;

import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRequestRepository extends JpaRepository<ChatRequest, String> {
    List<ChatRequest> findByDoctorAndStatus(User doctor, RequestStatus status);
    List<ChatRequest> findByPatientAndStatus(User patient, RequestStatus status);
    Optional<ChatRequest> findByPatientAndDoctorAndStatus(User patient, User doctor, RequestStatus status);
    boolean existsByPatientAndDoctorAndStatus(User patient, User doctor, RequestStatus status);
} 
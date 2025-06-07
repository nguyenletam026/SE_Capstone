package com.capstone.service;

import com.capstone.dto.request.WithdrawalRequestDto;
import com.capstone.dto.response.WithdrawalRequestResponse;
import com.capstone.entity.DoctorUpgrade;
import com.capstone.entity.User;
import com.capstone.entity.WithdrawalRequest;
import com.capstone.repository.DoctorUpgradeRepository;
import com.capstone.repository.UserRepository;
import com.capstone.repository.WithdrawalRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WithdrawalRequestService {    @Autowired
    private WithdrawalRequestRepository withdrawalRequestRepository;

    @Autowired
    private DoctorUpgradeRepository doctorUpgradeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileUploadService fileUploadService;

    /**
     * Create a new withdrawal request
     */    @Transactional
    public WithdrawalRequestResponse createWithdrawalRequest(User doctor, WithdrawalRequestDto requestDto) {
        // Validate doctor balance - convert Double to BigDecimal for comparison
        Double doctorBalance = doctor.getDoctorBalance();
        BigDecimal doctorBalanceDecimal = BigDecimal.valueOf(doctorBalance);
        if (doctorBalanceDecimal.compareTo(requestDto.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance for withdrawal");
        }

        // Check for pending withdrawal requests
        List<WithdrawalRequest> pendingRequests = withdrawalRequestRepository
            .findByDoctorAndStatus(doctor, WithdrawalRequest.WithdrawalStatus.PENDING);
          if (!pendingRequests.isEmpty()) {
            throw new RuntimeException("You have a pending withdrawal request. Please wait for it to be processed.");
        }        // Reserve funds by deducting from doctor's balance immediately
        try {
            BigDecimal newBalance = doctorBalanceDecimal.subtract(requestDto.getAmount());
            doctor.setDoctorBalance(newBalance.doubleValue());
            userRepository.save(doctor);
            System.out.println("Reserved " + requestDto.getAmount() + " VND from doctor " + doctor.getUsername() + "'s balance for withdrawal request");
        } catch (Exception e) {
            throw new RuntimeException("Failed to reserve funds for withdrawal request: " + e.getMessage());
        }

        WithdrawalRequest withdrawal = WithdrawalRequest.builder()
            .doctor(doctor)
            .amount(requestDto.getAmount())
            .bankName(requestDto.getBankName())
            .accountNumber(requestDto.getAccountNumber())
            .accountHolderName(requestDto.getAccountHolderName())
            .note(requestDto.getNote())
            .status(WithdrawalRequest.WithdrawalStatus.PENDING)
            .requestedAt(LocalDateTime.now())
            .build();

        WithdrawalRequest savedWithdrawal = withdrawalRequestRepository.save(withdrawal);
        return convertToResponse(savedWithdrawal);
    }

    /**
     * Get doctor's withdrawal requests
     */
    public List<WithdrawalRequestResponse> getDoctorWithdrawalRequests(User doctor) {
        List<WithdrawalRequest> requests = withdrawalRequestRepository
            .findByDoctorOrderByRequestedAtDesc(doctor);

        return requests.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get doctor's withdrawal requests with pagination
     */
    public Page<WithdrawalRequestResponse> getDoctorWithdrawalRequestsPaginated(User doctor, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WithdrawalRequest> requests = withdrawalRequestRepository
            .findByDoctorOrderByRequestedAtDesc(doctor, pageable);

        return requests.map(this::convertToResponse);
    }

    /**
     * Get all withdrawal requests for admin
     */
    public List<WithdrawalRequestResponse> getAllWithdrawalRequests() {
        List<WithdrawalRequest> requests = withdrawalRequestRepository
            .findAllOrderByRequestedAtDesc();

        return requests.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get withdrawal requests by status for admin
     */
    public List<WithdrawalRequestResponse> getWithdrawalRequestsByStatus(WithdrawalRequest.WithdrawalStatus status) {
        List<WithdrawalRequest> requests = withdrawalRequestRepository
            .findByStatusOrderByRequestedAtDesc(status);

        return requests.stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get withdrawal requests with pagination for admin
     */
    public Page<WithdrawalRequestResponse> getAllWithdrawalRequestsPaginated(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<WithdrawalRequest> requests = withdrawalRequestRepository
            .findAllOrderByRequestedAtDesc(pageable);

        return requests.map(this::convertToResponse);
    }

    /**
     * Approve withdrawal request
     */    @Transactional
    public WithdrawalRequestResponse approveWithdrawalRequest(String requestId, MultipartFile transferProofFile, String adminNote) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        // Upload transfer proof if provided
        String transferProofUrl = null;
        if (transferProofFile != null && !transferProofFile.isEmpty()) {
            transferProofUrl = fileUploadService.uploadFile(transferProofFile, "transfer-proofs");
        }

        // Update withdrawal request (funds already deducted when request was created)
        request.setStatus(WithdrawalRequest.WithdrawalStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setTransferProofUrl(transferProofUrl);
        request.setAdminNote(adminNote);

        WithdrawalRequest savedRequest = withdrawalRequestRepository.save(request);
        System.out.println("Approved withdrawal request " + requestId + " for " + request.getAmount() + " VND");
        return convertToResponse(savedRequest);
    }
    @Transactional
    public WithdrawalRequestResponse rejectWithdrawalRequest(String requestId, String adminNote) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        // Restore the reserved funds to doctor's balance
        User doctor = request.getDoctor();
        try {
            doctor.setDoctorBalance(doctor.getDoctorBalance() + request.getAmount().doubleValue());
            userRepository.save(doctor);
            System.out.println("Restored " + request.getAmount() + " VND to doctor " + doctor.getUsername() + "'s balance after rejection");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore funds after rejection: " + e.getMessage());
        }

        request.setStatus(WithdrawalRequest.WithdrawalStatus.REJECTED);
        request.setRejectedAt(LocalDateTime.now());
        request.setAdminNote(adminNote);

        WithdrawalRequest savedRequest = withdrawalRequestRepository.save(request);
        return convertToResponse(savedRequest);
    }

    /**
     * Cancel withdrawal request (by doctor)
     */
    @Transactional
    public WithdrawalRequestResponse cancelWithdrawalRequest(String requestId, User doctor) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));

        if (!request.getDoctor().getId().equals(doctor.getId())) {
            throw new RuntimeException("You can only cancel your own withdrawal requests");
        }        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be cancelled");
        }

        // Restore the reserved funds to doctor's balance
        try {
            doctor.setDoctorBalance(doctor.getDoctorBalance() + request.getAmount().doubleValue());
            userRepository.save(doctor);
            System.out.println("Restored " + request.getAmount() + " VND to doctor " + doctor.getUsername() + "'s balance after cancellation");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore funds after cancellation: " + e.getMessage());
        }

        request.setStatus(WithdrawalRequest.WithdrawalStatus.CANCELLED);
        request.setCancelledAt(LocalDateTime.now());

        WithdrawalRequest savedRequest = withdrawalRequestRepository.save(request);
        return convertToResponse(savedRequest);
    }

    /**
     * Get doctor's total withdrawal amount
     */
    public BigDecimal getDoctorTotalWithdrawals(User doctor) {
        return withdrawalRequestRepository.calculateTotalWithdrawalsByDoctor(doctor);
    }    /**
     * Get doctor's withdrawal statistics
     */
    public Map<String, Object> getDoctorWithdrawalStats(User doctor) {
        BigDecimal totalRequested = withdrawalRequestRepository
            .calculateTotalRequestedByDoctor(doctor);
        BigDecimal totalApproved = withdrawalRequestRepository
            .calculateTotalWithdrawalsByDoctor(doctor);
        long pendingCount = withdrawalRequestRepository
            .countByDoctorAndStatus(doctor, WithdrawalRequest.WithdrawalStatus.PENDING);
        long approvedCount = withdrawalRequestRepository
            .countByDoctorAndStatus(doctor, WithdrawalRequest.WithdrawalStatus.APPROVED);
        long rejectedCount = withdrawalRequestRepository
            .countByDoctorAndStatus(doctor, WithdrawalRequest.WithdrawalStatus.REJECTED);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequested", totalRequested);
        stats.put("totalApproved", totalApproved);
        stats.put("pendingCount", pendingCount);
        stats.put("approvedCount", approvedCount);
        stats.put("rejectedCount", rejectedCount);

        return stats;
    }    /**
     * Get admin withdrawal statistics
     */
    public Map<String, Object> getAdminWithdrawalStats() {
        long totalRequests = withdrawalRequestRepository.count();
        long pendingRequests = withdrawalRequestRepository
            .countByStatus(WithdrawalRequest.WithdrawalStatus.PENDING);
        long approvedRequests = withdrawalRequestRepository
            .countByStatus(WithdrawalRequest.WithdrawalStatus.APPROVED);
        long rejectedRequests = withdrawalRequestRepository
            .countByStatus(WithdrawalRequest.WithdrawalStatus.REJECTED);
        BigDecimal totalApprovedAmount = withdrawalRequestRepository
            .calculateTotalApprovedWithdrawals();
        BigDecimal totalPendingAmount = withdrawalRequestRepository
            .calculateTotalPendingWithdrawals();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRequests", totalRequests);
        stats.put("pendingRequests", pendingRequests);
        stats.put("approvedRequests", approvedRequests);
        stats.put("rejectedRequests", rejectedRequests);
        stats.put("totalApprovedAmount", totalApprovedAmount);
        stats.put("totalPendingAmount", totalPendingAmount);

        return stats;
    }    /**
     * Convert WithdrawalRequest entity to response DTO
     */
    private WithdrawalRequestResponse convertToResponse(WithdrawalRequest request) {
        User doctor = request.getDoctor();

        // Get doctor additional information from DoctorUpgrade
        String doctorPhone = null;
        String doctorEmail = doctor.getUsername(); // Email is the username
        String doctorSpecialty = null;

        // Try to get latest approved doctor upgrade information
        try {
            Optional<DoctorUpgrade> doctorUpgrade = doctorUpgradeRepository.findLatestByUser(doctor);
            if (doctorUpgrade.isPresent()) {
                DoctorUpgrade upgrade = doctorUpgrade.get();
                doctorPhone = upgrade.getPhoneNumber();
                doctorSpecialty = upgrade.getSpecialization();
                System.out.println("Found doctor upgrade for user " + doctor.getUsername() +
                                 " - Phone: " + doctorPhone + ", Specialty: " + doctorSpecialty);
            } else {
                System.out.println("No approved doctor upgrade found for user: " + doctor.getUsername());
                // Fallback: try to get any doctor upgrade regardless of status
                List<DoctorUpgrade> allUpgrades = doctorUpgradeRepository.findByUser(doctor);
                if (!allUpgrades.isEmpty()) {
                    DoctorUpgrade latestUpgrade = allUpgrades.get(allUpgrades.size() - 1);
                    doctorPhone = latestUpgrade.getPhoneNumber();
                    doctorSpecialty = latestUpgrade.getSpecialization();
                    System.out.println("Using fallback doctor upgrade (status: " + latestUpgrade.getStatus() +
                                     ") - Phone: " + doctorPhone + ", Specialty: " + doctorSpecialty);
                }
            }
        } catch (Exception e) {
            System.err.println("Error retrieving doctor upgrade information: " + e.getMessage());
            e.printStackTrace();
        }

        return WithdrawalRequestResponse.builder()
            .id(request.getId())
            .doctorId(doctor.getId())
            .doctorName(doctor.getFullName())
            .amount(request.getAmount().doubleValue())
            .bankName(request.getBankName())
            .accountNumber(request.getAccountNumber())
            .accountHolderName(request.getAccountHolderName())
            .note(request.getNote())
            .status(request.getStatus())
            .requestedAt(request.getRequestedAt())
            .approvedAt(request.getApprovedAt())
            .rejectedAt(request.getRejectedAt())
            .cancelledAt(request.getCancelledAt())
            .transferProofUrl(request.getTransferProofUrl())
            .adminNote(request.getAdminNote())
            .doctorPhone(doctorPhone)
            .doctorEmail(doctorEmail)
            .doctorSpecialty(doctorSpecialty)
            .createdAt(request.getCreatedAt())
            .processedAt(request.getProcessedAt())
            .build();
    }

    /**
     * Update transfer proof for an existing withdrawal request
     */
    @Transactional
    public WithdrawalRequestResponse updateTransferProof(String requestId, MultipartFile transferProofFile) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Withdrawal request not found"));

        if (request.getStatus() != WithdrawalRequest.WithdrawalStatus.APPROVED &&
            request.getStatus() != WithdrawalRequest.WithdrawalStatus.COMPLETED) {
            throw new RuntimeException("Transfer proof can only be updated for approved or completed requests");
        }

        // Upload transfer proof
        String transferProofUrl = null;
        if (transferProofFile != null && !transferProofFile.isEmpty()) {
            transferProofUrl = fileUploadService.uploadFile(transferProofFile, "transfer-proofs");
        }

        // Update withdrawal request with new transfer proof
        request.setTransferProofUrl(transferProofUrl);
        if (request.getStatus() == WithdrawalRequest.WithdrawalStatus.APPROVED) {
            request.setStatus(WithdrawalRequest.WithdrawalStatus.COMPLETED);
        }

        WithdrawalRequest savedRequest = withdrawalRequestRepository.save(request);
        return convertToResponse(savedRequest);
    }
}

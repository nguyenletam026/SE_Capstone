package com.capstone.service;

import com.capstone.entity.ChatPayment;
import com.capstone.entity.DoctorEarning;
import com.capstone.entity.User;
import com.capstone.repository.DoctorEarningRepository;
import com.capstone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoctorEarningService {    @Autowired
    private DoctorEarningRepository doctorEarningRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SystemConfigService systemConfigService;

    // Default commission rate for doctors (70%) - used as fallback
    private static final BigDecimal DEFAULT_COMMISSION_RATE = BigDecimal.valueOf(70);/**
     * Create a doctor earning record when a chat payment is completed
     */
    @Transactional
    public DoctorEarning createEarning(ChatPayment chatPayment, User doctor, BigDecimal commissionPercentage) {
        // Convert double amount to BigDecimal
        BigDecimal totalAmount = BigDecimal.valueOf(chatPayment.getAmount());
        
        // Calculate doctor earning amount
        BigDecimal doctorEarning = totalAmount
            .multiply(commissionPercentage)
            .divide(BigDecimal.valueOf(100));
        
        // Calculate platform fee
        BigDecimal platformFee = totalAmount.subtract(doctorEarning);

        DoctorEarning earning = DoctorEarning.builder()
            .chatPayment(chatPayment)
            .doctor(doctor)
            .totalAmount(totalAmount)
            .commissionPercentage(commissionPercentage)
            .doctorEarning(doctorEarning)
            .platformFee(platformFee)
            .status(DoctorEarning.EarningStatus.PENDING)
            .createdAt(LocalDateTime.now())
            .build();

        return doctorEarningRepository.save(earning);
    }    /**
     * Create a doctor earning record with configurable commission rate when a chat payment is completed
     */
    @Transactional
    public DoctorEarning createEarningFromPayment(ChatPayment chatPayment) {
        User doctor = chatPayment.getChatRequest().getDoctor();
        
        // Get commission rate from system config
        double commissionRate = systemConfigService.getDoctorCommissionRate();
        BigDecimal commissionPercentage = BigDecimal.valueOf(commissionRate);
        
        return createEarning(chatPayment, doctor, commissionPercentage);
    }

    /**
     * Confirm doctor earning and add to doctor balance
     */
    @Transactional
    public DoctorEarning confirmEarning(String earningId) {
        DoctorEarning earning = doctorEarningRepository.findById(earningId)
            .orElseThrow(() -> new RuntimeException("Doctor earning not found"));

        if (earning.getStatus() != DoctorEarning.EarningStatus.PENDING) {
            throw new RuntimeException("Earning is not in pending status");
        }

        // Update earning status
        earning.setStatus(DoctorEarning.EarningStatus.CONFIRMED);
        earning.setConfirmedAt(LocalDateTime.now());        // Add to doctor balance
        User doctor = earning.getDoctor();
        Double currentBalance = doctor.getDoctorBalance() != null ? doctor.getDoctorBalance() : 0.0;
        doctor.setDoctorBalance(currentBalance + earning.getDoctorEarning().doubleValue());
        userRepository.save(doctor);

        return doctorEarningRepository.save(earning);
    }

    /**
     * Get doctor's earnings history
     */
    public List<DoctorEarning> getDoctorEarnings(User doctor) {
        return doctorEarningRepository.findByDoctorOrderByCreatedAtDesc(doctor);
    }

    /**
     * Get doctor's confirmed earnings
     */
    public List<DoctorEarning> getDoctorConfirmedEarnings(User doctor) {
        return doctorEarningRepository.findByDoctorAndStatus(doctor, DoctorEarning.EarningStatus.CONFIRMED);
    }    /**
     * Get doctor's total earnings
     */
    public BigDecimal getDoctorTotalEarnings(User doctor) {
        return doctorEarningRepository.calculateTotalEarningsByDoctorAndStatus(doctor, DoctorEarning.EarningStatus.CONFIRMED);
    }

    /**
     * Get doctor's total confirmed earnings
     */
    public BigDecimal getDoctorTotalConfirmedEarnings(User doctor) {
        return doctorEarningRepository.calculateTotalEarningsByDoctorAndStatus(doctor, DoctorEarning.EarningStatus.CONFIRMED);
    }

    /**
     * Get doctor's monthly earnings summary
     */
    public List<Object[]> getDoctorMonthlySummary(User doctor) {
        return doctorEarningRepository.getMonthlySummaryByDoctor(doctor, DoctorEarning.EarningStatus.CONFIRMED);
    }

    /**
     * Get doctor's earnings within date range
     */
    public List<DoctorEarning> getDoctorEarningsByDateRange(User doctor, LocalDateTime startDate, LocalDateTime endDate) {
        return doctorEarningRepository.findByDoctorAndDateRange(doctor, startDate, endDate);
    }

    /**
     * Mark earning as withdrawn (when doctor makes withdrawal request)
     */
    @Transactional
    public void markEarningsAsWithdrawn(List<DoctorEarning> earnings) {
        for (DoctorEarning earning : earnings) {
            earning.setStatus(DoctorEarning.EarningStatus.WITHDRAWN);
            earning.setWithdrawnAt(LocalDateTime.now());
        }
        doctorEarningRepository.saveAll(earnings);
    }

    /**
     * Get all earnings for admin view
     */
    public List<DoctorEarning> getAllEarnings() {
        return doctorEarningRepository.findAllOrderByCreatedAtDesc();
    }    /**
     * Get earnings by status for admin
     */
    public List<DoctorEarning> getEarningsByStatus(DoctorEarning.EarningStatus status) {
        return doctorEarningRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    /**
     * Get platform fees summary for admin dashboard
     */
    public BigDecimal getTotalPlatformFees() {
        return doctorEarningRepository.calculateTotalPlatformFeesByStatus(DoctorEarning.EarningStatus.CONFIRMED);
    }
}

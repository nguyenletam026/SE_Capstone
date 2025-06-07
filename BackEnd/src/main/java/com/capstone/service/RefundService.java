package com.capstone.service;

import com.capstone.configuration.RefundConfigurationProperties;
import com.capstone.dto.response.RefundHistoryResponse;
import com.capstone.entity.ChatPayment;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.User;
import com.capstone.repository.ChatMessageRepository;
import com.capstone.repository.ChatPaymentRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {
      private final ChatPaymentRepository chatPaymentRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final DoctorScheduleService doctorScheduleService;    private final RefundConfigurationProperties refundConfig;
    
    /**
     * Kiểm tra và xử lý hoàn tiền cho các trường hợp doctor không phản hồi
     */
    @Transactional
    public int processRefundForUnresponsiveDoctors() {
        if (!refundConfig.isAutoRefundEnabled()) {
            log.info("Automatic refunds are disabled");
            return 0;
        }
        
        log.info("Starting automatic refund check for unresponsive doctors");
        
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(refundConfig.getDoctorResponseTimeout());
        
        // Tìm các payment đã được tạo từ 30 phút trước và chưa được hoàn tiền
        List<ChatPayment> paymentsToCheck = chatPaymentRepository.findPaymentsEligibleForRefund(cutoffTime);
        
        log.info("Found {} payments to check for refund eligibility", paymentsToCheck.size());
        
        int refundsProcessed = 0;
        
        for (ChatPayment payment : paymentsToCheck) {
            try {
                // Kiểm tra xem doctor đã phản hồi chưa
                boolean doctorResponded = chatMessageRepository.hasDoctorRespondedAfterPayment(payment.getId());
                
                if (!doctorResponded) {
                    // Doctor chưa phản hồi - thực hiện hoàn tiền
                    boolean success = processRefundForPayment(payment);
                    if (success) {
                        refundsProcessed++;
                    }
                }
            } catch (Exception e) {                log.error("Error processing refund for payment {}: {}", payment.getId(), e.getMessage(), e);
            }
        }
        
        log.info("Processed {} automatic refunds", refundsProcessed);
        return refundsProcessed;
    }
    
    /**
     * Xử lý hoàn tiền cho một payment cụ thể
     */
    @Transactional
    public boolean processRefundForPayment(ChatPayment payment) {
        ChatRequest chatRequest = payment.getChatRequest();
        User patient = chatRequest.getPatient();
        User doctor = chatRequest.getDoctor();
        
        log.info("Processing refund for payment {} - Patient: {}, Doctor: {}", 
                payment.getId(), patient.getUsername(), doctor.getUsername());
        
        try {
            // Doctor chưa phản hồi - thực hiện hoàn tiền
            executeRefund(payment, "DOCTOR_NO_RESPONSE");
            return true;
        } catch (Exception e) {
            log.error("Failed to process refund for payment {}: {}", payment.getId(), e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Thực hiện hoàn tiền
     */
    @Transactional
    public void executeRefund(ChatPayment payment, String reason) {
        ChatRequest chatRequest = payment.getChatRequest();
        User patient = chatRequest.getPatient();
        User doctor = chatRequest.getDoctor();
        
        double refundAmount = payment.getAmount();
        
        // Tính toán phần trăm hoàn tiền dựa trên lý do
        double refundPercentage = calculateRefundPercentage(reason);
        double actualRefundAmount = refundAmount * refundPercentage;
        
        // Hoàn tiền vào tài khoản patient
        patient.setBalance(patient.getBalance() + actualRefundAmount);
        userRepository.save(patient);
        
        // Cập nhật trạng thái payment
        payment.setRefunded(true);
        payment.setRefundAmount(actualRefundAmount);
        payment.setRefundReason(reason);
        payment.setRefundedAt(LocalDateTime.now());
        chatPaymentRepository.save(payment);
        
        // Giải phóng appointment slot
        if (chatRequest.getDoctorSchedule() != null) {
            try {
                boolean released = doctorScheduleService.releaseAppointmentSlot(
                        chatRequest.getDoctorSchedule().getId());
                log.info("Released appointment slot {} for refunded payment: {}", 
                        chatRequest.getDoctorSchedule().getId(), released);
            } catch (Exception e) {
                log.error("Failed to release appointment slot for payment {}: {}", 
                        payment.getId(), e.getMessage());
            }
        }
        
        log.info("Refund processed: Payment {}, Amount: {}, Reason: {}", 
                payment.getId(), actualRefundAmount, reason);
        
        // Gửi thông báo cho patient về việc hoàn tiền
        sendRefundNotificationToPatient(patient, actualRefundAmount, reason);
        
        // Gửi cảnh báo cho doctor về việc không phản hồi
        sendWarningNotificationToDoctor(doctor, patient.getUsername(), actualRefundAmount);
    }
      /**
     * Tính toán phần trăm hoàn tiền dựa trên lý do
     */
    private double calculateRefundPercentage(String reason) {
        String configKey = reason.toLowerCase().replace("_", "-");
        return refundConfig.getRefundPercentage(configKey) / 100.0;
    }
      /**
     * Gửi thông báo hoàn tiền cho patient
     */
    private void sendRefundNotificationToPatient(User patient, double refundAmount, String reason) {
        if (!refundConfig.getNotifications().isNotifyPatients()) {
            return;
        }
        
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "REFUND_PROCESSED");
            notification.put("amount", refundAmount);
            notification.put("reason", reason);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("message", String.format("Bạn đã được hoàn tiền %.0f VND do bác sĩ không phản hồi", refundAmount));
            
            messagingTemplate.convertAndSendToUser(
                patient.getUsername(),
                "/queue/notifications",
                notification
            );
            
            log.info("Refund notification sent to patient: {}", patient.getUsername());
        } catch (Exception e) {
            log.error("Failed to send refund notification to patient {}: {}", 
                    patient.getUsername(), e.getMessage());
        }
    }
      /**
     * Gửi cảnh báo cho doctor về việc không phản hồi
     */
    private void sendWarningNotificationToDoctor(User doctor, String patientName, double refundAmount) {
        if (!refundConfig.getNotifications().isNotifyDoctors()) {
            return;
        }
        
        try {
            Map<String, Object> notification = new HashMap<>();
            notification.put("type", "DOCTOR_WARNING");
            notification.put("patientName", patientName);
            notification.put("refundAmount", refundAmount);
            notification.put("timestamp", LocalDateTime.now().toString());
            notification.put("message", String.format("Cảnh báo: Bạn đã không phản hồi bệnh nhân %s. %.0f VND đã được hoàn tiền.", patientName, refundAmount));
            
            messagingTemplate.convertAndSendToUser(
                doctor.getUsername(),
                "/queue/notifications",
                notification
            );
            
            log.info("Warning notification sent to doctor: {}", doctor.getUsername());
        } catch (Exception e) {
            log.error("Failed to send warning notification to doctor {}: {}", 
                    doctor.getUsername(), e.getMessage());
        }
    }
    
    /**
     * Kiểm tra xem một payment có đủ điều kiện hoàn tiền không
     */
    public boolean isEligibleForRefund(ChatPayment payment) {
        // Kiểm tra payment chưa hết hạn và chưa được hoàn tiền
        LocalDateTime now = LocalDateTime.now();
        boolean isStillActive = payment.getExpiresAt().isAfter(now);
        boolean notRefunded = !payment.isRefunded();
          // Kiểm tra thời gian đã trôi qua từ khi tạo payment
        LocalDateTime cutoffTime = payment.getCreatedAt().plusMinutes(refundConfig.getDoctorResponseTimeout());
        boolean timeoutReached = now.isAfter(cutoffTime);
        
        return isStillActive && notRefunded && timeoutReached;
    }    /**
     * Lấy lịch sử hoàn tiền cho user
     */
    public List<RefundHistoryResponse> getRefundHistory(User user) {
        List<ChatPayment> refundedPayments;
        
        if ("USER".equals(user.getRole().getName())) {
            refundedPayments = chatPaymentRepository.findRefundHistoryByPatient(user);
        } else if ("DOCTOR".equals(user.getRole().getName())) {
            refundedPayments = chatPaymentRepository.findRefundHistoryByDoctor(user);
        } else {
            return new ArrayList<>();
        }
        
        return refundedPayments.stream()
                .map(payment -> RefundHistoryResponse.builder()
                        .paymentId(payment.getId())
                        .chatRequestId(payment.getChatRequest().getId())
                        .doctorName(getFullName(payment.getChatRequest().getDoctor()))
                        .patientName(getFullName(payment.getChatRequest().getPatient()))
                        .originalAmount(payment.getAmount())
                        .refundAmount(payment.getRefundAmount())
                        .refundReason(payment.getRefundReason())
                        .paymentDate(payment.getCreatedAt())
                        .refundDate(payment.getRefundedAt())
                        .hoursPurchased(payment.getHours())
                        .refundPercentage(String.format("%.0f%%", (payment.getRefundAmount() / payment.getAmount()) * 100))
                        .viewerRole(user.getRole().getName())
                        .build())
                .collect(Collectors.toList());
    }
    
    /**
     * Helper method to get full name from User
     */
    private String getFullName(User user) {
        if (user.getFirstName() != null && user.getLastName() != null) {
            return user.getFirstName() + " " + user.getLastName();
        } else if (user.getFirstName() != null) {
            return user.getFirstName();
        } else if (user.getLastName() != null) {
            return user.getLastName();
        } else {
            return user.getUsername();
        }
    }
    
    /**
     * Xử lý hoàn tiền thủ công (Admin)
     */
    @Transactional
    public boolean processManualRefund(String paymentId, String reason) {
        try {
            ChatPayment payment = chatPaymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            if (payment.isRefunded()) {
                log.warn("Payment {} is already refunded", paymentId);
                return false;
            }
            
            executeRefund(payment, reason);
            return true;
        } catch (Exception e) {
            log.error("Error processing manual refund for payment {}: {}", paymentId, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Lấy danh sách payments có thể hoàn tiền
     */    public List<ChatPayment> getPaymentsEligibleForRefund() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(refundConfig.getDoctorResponseTimeout());
        return chatPaymentRepository.findPaymentsEligibleForRefund(cutoffTime);
    }
    
    /**
     * Tạo thống kê hoàn tiền
     */
    public Object generateRefundStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Tổng số hoàn tiền trong tháng
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<ChatPayment> monthlyRefunds = chatPaymentRepository.findAll().stream()
                .filter(p -> p.isRefunded() && p.getRefundedAt().isAfter(startOfMonth))
                .collect(Collectors.toList());
        
        stats.put("totalRefundsThisMonth", monthlyRefunds.size());
        stats.put("totalRefundAmountThisMonth", monthlyRefunds.stream()
                .mapToDouble(ChatPayment::getRefundAmount)
                .sum());
        
        // Thống kê theo lý do
        Map<String, Long> refundReasons = monthlyRefunds.stream()
                .collect(Collectors.groupingBy(ChatPayment::getRefundReason, Collectors.counting()));
        stats.put("refundReasons", refundReasons);
        
        // Payments đang chờ xử lý
        List<ChatPayment> eligiblePayments = getPaymentsEligibleForRefund();
        stats.put("paymentsEligibleForRefund", eligiblePayments.size());
        
        log.info("Generated refund statistics: {}", stats);
        return stats;
    }
    
    /**
     * Xử lý yêu cầu hoàn tiền từ patient
     */
    @Transactional
    public boolean requestRefund(String paymentId, User patient, String reason) {
        try {
            ChatPayment payment = chatPaymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            // Kiểm tra payment thuộc về patient này
            if (!payment.getChatRequest().getPatient().getId().equals(patient.getId())) {
                throw new RuntimeException("Payment does not belong to this patient");
            }
            
            if (payment.isRefunded()) {
                log.warn("Payment {} is already refunded", paymentId);
                return false;
            }
            
            // Kiểm tra điều kiện hoàn tiền
            if (isEligibleForRefund(payment)) {
                executeRefund(payment, "Patient request: " + reason);
                return true;
            } else {
                log.warn("Payment {} is not eligible for refund", paymentId);
                return false;
            }
        } catch (Exception e) {
            log.error("Error processing refund request for payment {}: {}", paymentId, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Get refund warnings for a specific doctor
     */
    public Object getDoctorRefundWarnings(User doctor) {
        if (!"DOCTOR".equals(doctor.getRole().getName())) {
            throw new RuntimeException("User is not a doctor");
        }
        
        Map<String, Object> warnings = new HashMap<>();
        
        // Count refunds caused by this doctor in the last month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<ChatPayment> doctorRefunds = chatPaymentRepository.findAll().stream()
                .filter(p -> p.isRefunded() && 
                           p.getRefundedAt().isAfter(startOfMonth) &&
                           p.getChatRequest().getDoctor().getId().equals(doctor.getId()) &&
                           "DOCTOR_NO_RESPONSE".equals(p.getRefundReason()))
                .collect(Collectors.toList());
        
        int refundCount = doctorRefunds.size();
        double totalRefundAmount = doctorRefunds.stream()
                .mapToDouble(ChatPayment::getRefundAmount)
                .sum();
        
        warnings.put("monthlyRefundCount", refundCount);
        warnings.put("monthlyRefundAmount", totalRefundAmount);
        warnings.put("warningLevel", getWarningLevel(refundCount));
        warnings.put("message", getWarningMessage(refundCount));
        
        // Get details of recent refunds
        List<Map<String, Object>> recentRefunds = doctorRefunds.stream()
                .limit(5)
                .map(payment -> {
                    Map<String, Object> refund = new HashMap<>();
                    refund.put("paymentId", payment.getId());
                    refund.put("patientName", payment.getChatRequest().getPatient().getUsername());
                    refund.put("refundAmount", payment.getRefundAmount());
                    refund.put("refundDate", payment.getRefundedAt());
                    return refund;
                })
                .collect(Collectors.toList());
        
        warnings.put("recentRefunds", recentRefunds);
        
        log.info("Generated refund warnings for doctor {}: {} refunds this month", 
                doctor.getUsername(), refundCount);
        return warnings;
    }
    
    /**
     * Get doctor response statistics
     */
    public Object getDoctorResponseStats(User doctor) {
        if (!"DOCTOR".equals(doctor.getRole().getName())) {
            throw new RuntimeException("User is not a doctor");
        }
        
        Map<String, Object> stats = new HashMap<>();
        
        // Get all approved chat requests for this doctor in the last month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<ChatPayment> allPayments = chatPaymentRepository.findAll().stream()
                .filter(p -> p.getChatRequest().getDoctor().getId().equals(doctor.getId()) &&
                           p.getCreatedAt().isAfter(startOfMonth))
                .collect(Collectors.toList());
        
        int totalPayments = allPayments.size();
        
        // Count how many resulted in refunds due to no response
        int noResponseRefunds = (int) allPayments.stream()
                .filter(p -> p.isRefunded() && "DOCTOR_NO_RESPONSE".equals(p.getRefundReason()))
                .count();
        
        // Count successful consultations (no refunds)
        int successfulConsultations = totalPayments - noResponseRefunds;
        
        // Calculate response rate
        double responseRate = totalPayments > 0 ? 
                (double) successfulConsultations / totalPayments * 100 : 100.0;
        
        stats.put("totalPaymentsThisMonth", totalPayments);
        stats.put("successfulConsultations", successfulConsultations);
        stats.put("noResponseRefunds", noResponseRefunds);
        stats.put("responseRate", Math.round(responseRate * 100.0) / 100.0);
        stats.put("responseRating", getResponseRating(responseRate));
        
        // Revenue statistics
        double totalRevenue = allPayments.stream()
                .filter(p -> !p.isRefunded())
                .mapToDouble(ChatPayment::getAmount)
                .sum();
        
        double lostRevenue = allPayments.stream()
                .filter(p -> p.isRefunded())
                .mapToDouble(ChatPayment::getRefundAmount)
                .sum();
        
        stats.put("totalRevenue", totalRevenue);
        stats.put("lostRevenue", lostRevenue);
        
        log.info("Generated response statistics for doctor {}: {}% response rate", 
                doctor.getUsername(), responseRate);
        return stats;
    }
    
    /**
     * Get warning level based on refund count
     */
    private String getWarningLevel(int refundCount) {
        if (refundCount >= refundConfig.getDoctorWarningThresholds().getSevere()) {
            return "SEVERE";
        } else if (refundCount >= refundConfig.getDoctorWarningThresholds().getModerate()) {
            return "MODERATE";
        } else if (refundCount >= refundConfig.getDoctorWarningThresholds().getMild()) {
            return "MILD";
        } else {
            return "NONE";
        }
    }
    
    /**
     * Get warning message based on refund count
     */
    private String getWarningMessage(int refundCount) {
        if (refundCount >= refundConfig.getDoctorWarningThresholds().getSevere()) {
            return "Cảnh báo nghiêm trọng: Bạn có quá nhiều hoàn tiền do không phản hồi. Hãy cải thiện thời gian phản hồi của bạn.";
        } else if (refundCount >= refundConfig.getDoctorWarningThresholds().getModerate()) {
            return "Cảnh báo vừa phải: Số lượng hoàn tiền của bạn cao hơn mức bình thường. Hãy chú ý phản hồi bệnh nhân kịp thời.";
        } else if (refundCount >= refundConfig.getDoctorWarningThresholds().getMild()) {
            return "Cảnh báo nhẹ: Hãy đảm bảo phản hồi bệnh nhân trong thời gian quy định.";
        } else {
            return "Tuyệt vời! Bạn đang duy trì tỷ lệ phản hồi tốt.";
        }
    }
    
    /**
     * Get response rating based on response rate
     */
    private String getResponseRating(double responseRate) {
        if (responseRate >= 95) {
            return "EXCELLENT";
        } else if (responseRate >= 85) {
            return "GOOD";
        } else if (responseRate >= 70) {
            return "FAIR";
        } else {
            return "POOR";
        }
    }

    // ...existing code...
}

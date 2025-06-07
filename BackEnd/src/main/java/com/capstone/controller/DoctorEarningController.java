package com.capstone.controller;

import com.capstone.entity.DoctorEarning;
import com.capstone.entity.User;
import com.capstone.service.DoctorEarningService;
import com.capstone.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor/earnings")
@RequiredArgsConstructor
public class DoctorEarningController {

    private final DoctorEarningService doctorEarningService;
    private final UserService userService;

    /**
     * Get doctor's earnings history
     */
    @GetMapping("/history")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorEarning>> getDoctorEarnings(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        List<DoctorEarning> earnings = doctorEarningService.getDoctorEarnings(doctor);
        return ResponseEntity.ok(earnings);
    }

    /**
     * Get doctor's confirmed earnings
     */
    @GetMapping("/confirmed")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorEarning>> getDoctorConfirmedEarnings(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        List<DoctorEarning> earnings = doctorEarningService.getDoctorConfirmedEarnings(doctor);
        return ResponseEntity.ok(earnings);
    }

    /**
     * Get doctor's earnings statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getDoctorEarningsStats(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("currentBalance", doctor.getDoctorBalance());
        stats.put("totalEarnings", doctorEarningService.getDoctorTotalEarnings(doctor));
        stats.put("confirmedEarnings", doctorEarningService.getDoctorTotalConfirmedEarnings(doctor));
        
        return ResponseEntity.ok(stats);
    }    /**
     * Get doctor's monthly earnings summary
     */
    @GetMapping("/monthly-summary")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<Object[]>> getDoctorMonthlySummary(Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        List<Object[]> monthlySummary = doctorEarningService.getDoctorMonthlySummary(doctor);
        return ResponseEntity.ok(monthlySummary);
    }

    /**
     * Get doctor's earnings within date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorEarning>> getDoctorEarningsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            Authentication authentication) {
        User doctor = userService.getUserByUsername(authentication.getName());
        
        LocalDateTime start = LocalDateTime.parse(startDate);
        LocalDateTime end = LocalDateTime.parse(endDate);
        
        List<DoctorEarning> earnings = doctorEarningService.getDoctorEarningsByDateRange(doctor, start, end);
        return ResponseEntity.ok(earnings);
    }

    // Admin endpoints
    
    /**
     * Get all earnings for admin
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorEarning>> getAllEarnings() {
        List<DoctorEarning> earnings = doctorEarningService.getAllEarnings();
        return ResponseEntity.ok(earnings);
    }

    /**
     * Get earnings by status for admin
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorEarning>> getEarningsByStatus(@PathVariable String status) {
        DoctorEarning.EarningStatus earningStatus = DoctorEarning.EarningStatus.valueOf(status.toUpperCase());
        List<DoctorEarning> earnings = doctorEarningService.getEarningsByStatus(earningStatus);
        return ResponseEntity.ok(earnings);
    }    /**
     * Get platform fees summary for admin dashboard
     */
    @GetMapping("/admin/platform-fees")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BigDecimal> getTotalPlatformFees() {
        BigDecimal totalFees = doctorEarningService.getTotalPlatformFees();
        return ResponseEntity.ok(totalFees);
    }

    /**
     * Confirm doctor earning (admin only)
     */
    @PostMapping("/admin/confirm/{earningId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorEarning> confirmEarning(@PathVariable String earningId) {
        DoctorEarning confirmedEarning = doctorEarningService.confirmEarning(earningId);
        return ResponseEntity.ok(confirmedEarning);
    }
}

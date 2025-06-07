package com.capstone.repository;

import com.capstone.entity.DoctorEarning;
import com.capstone.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorEarningRepository extends JpaRepository<DoctorEarning, String> {
    
    /**
     * Find all earnings for a specific doctor
     */
    List<DoctorEarning> findByDoctorOrderByCreatedAtDesc(User doctor);
      /**
     * Find earnings by doctor and status
     */
    List<DoctorEarning> findByDoctorAndStatus(User doctor, DoctorEarning.EarningStatus status);
    
    /**
     * Find earnings by status for admin
     */
    List<DoctorEarning> findByStatusOrderByCreatedAtDesc(DoctorEarning.EarningStatus status);
    
    /**
     * Calculate total earnings for a doctor
     */
    @Query("SELECT COALESCE(SUM(de.doctorEarning), 0) FROM DoctorEarning de WHERE de.doctor = :doctor AND de.status = :status")
    BigDecimal calculateTotalEarningsByDoctorAndStatus(@Param("doctor") User doctor, @Param("status") DoctorEarning.EarningStatus status);
    
    /**
     * Find earnings within a date range
     */
    @Query("SELECT de FROM DoctorEarning de WHERE de.doctor = :doctor AND de.createdAt BETWEEN :startDate AND :endDate ORDER BY de.createdAt DESC")
    List<DoctorEarning> findByDoctorAndDateRange(@Param("doctor") User doctor, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find all earnings for admin view
     */
    @Query("SELECT de FROM DoctorEarning de ORDER BY de.createdAt DESC")
    List<DoctorEarning> findAllOrderByCreatedAtDesc();
    
    /**
     * Calculate total platform fees
     */
    @Query("SELECT COALESCE(SUM(de.platformFee), 0) FROM DoctorEarning de WHERE de.status = :status")
    BigDecimal calculateTotalPlatformFeesByStatus(@Param("status") DoctorEarning.EarningStatus status);
    
    /**
     * Get monthly earnings summary for a doctor
     */
    @Query("SELECT YEAR(de.createdAt) as year, MONTH(de.createdAt) as month, " +
           "COUNT(de) as totalTransactions, " +
           "SUM(de.doctorEarning) as totalEarnings " +
           "FROM DoctorEarning de " +
           "WHERE de.doctor = :doctor AND de.status = :status " +
           "GROUP BY YEAR(de.createdAt), MONTH(de.createdAt) " +
           "ORDER BY YEAR(de.createdAt) DESC, MONTH(de.createdAt) DESC")
    List<Object[]> getMonthlySummaryByDoctor(@Param("doctor") User doctor, @Param("status") DoctorEarning.EarningStatus status);
}

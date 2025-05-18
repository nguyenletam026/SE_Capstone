package com.capstone.repository;


import com.capstone.entity.DoctorUpgrade;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorUpgradeRepository extends JpaRepository<DoctorUpgrade, String> {
    List<DoctorUpgrade> findByUser(User user);
    
    // Find the latest doctor upgrade request for a user
    @Query("SELECT d FROM DoctorUpgrade d WHERE d.user = :user ORDER BY d.id DESC")
    Optional<DoctorUpgrade> findLatestByUser(@Param("user") User user);
    
    // Find pending doctor upgrade requests for a user
    List<DoctorUpgrade> findByUserAndStatus(User user, RequestStatus status);
}

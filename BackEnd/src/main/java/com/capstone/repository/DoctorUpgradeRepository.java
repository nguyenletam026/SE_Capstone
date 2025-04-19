package com.capstone.repository;


import com.capstone.entity.DoctorUpgrade;
import com.capstone.entity.User;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

=======
import com.capstone.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
>>>>>>> hieuDev
import java.util.Optional;

@Repository
public interface DoctorUpgradeRepository extends JpaRepository<DoctorUpgrade, String> {
    Optional<DoctorUpgrade> findByUser(User user);
<<<<<<< HEAD
=======
    List<DoctorUpgrade> findByStatus(RequestStatus status);

>>>>>>> hieuDev
}

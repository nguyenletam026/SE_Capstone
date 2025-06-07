package com.capstone.service;

import com.capstone.entity.ChatPayment;
import com.capstone.entity.ChatRequest;
import com.capstone.entity.DoctorEarning;
import com.capstone.entity.Role;
import com.capstone.entity.User;
import com.capstone.enums.RequestStatus;
import com.capstone.repository.ChatPaymentRepository;
import com.capstone.repository.ChatRequestRepository;
import com.capstone.repository.DoctorEarningRepository;
import com.capstone.repository.RoleRepository;
import com.capstone.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class DoctorEarningIntegrationTest {

    @Autowired
    private DoctorEarningService doctorEarningService;

    @Autowired
    private ChatPaymentService chatPaymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private ChatRequestRepository chatRequestRepository;

    @Autowired
    private ChatPaymentRepository chatPaymentRepository;

    @Autowired
    private DoctorEarningRepository doctorEarningRepository;

    private User doctor;
    private User patient;
    private Role doctorRole;
    private Role patientRole;

    @BeforeEach
    void setUp() {
        // Create roles        doctorRole = Role.builder()
                .name("DOCTOR")
                .build();
        doctorRole = roleRepository.save(doctorRole);

        patientRole = Role.builder()
                .name("PATIENT")
                .build();
        patientRole = roleRepository.save(patientRole);

        // Create test users
        doctor = User.builder()
                .username("test_doctor")
                .password("password")
                .firstName("Dr. Test")
                .lastName("Doctor")
                .role(doctorRole)
                .balance(0.0)
                .doctorBalance(0.0)
                .emailVerified(true)
                .banned(false)
                .build();
        doctor = userRepository.save(doctor);

        patient = User.builder()
                .username("test_patient")
                .password("password")
                .firstName("Test")
                .lastName("Patient")
                .role(patientRole)
                .balance(1000.0)
                .doctorBalance(0.0)
                .emailVerified(true)
                .banned(false)
                .build();
        patient = userRepository.save(patient);
    }

    @Test
    void testCreateEarningFromPayment() {
        // Create a chat request
        ChatRequest chatRequest = ChatRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .status(RequestStatus.APPROVED)
                .build();
        chatRequest = chatRequestRepository.save(chatRequest);

        // Create a chat payment
        ChatPayment payment = ChatPayment.builder()
                .chatRequest(chatRequest)
                .amount(100.0) // 100 VND
                .hours(1)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
        payment = chatPaymentRepository.save(payment);

        // Create earning
        DoctorEarning earning = doctorEarningService.createEarningFromPayment(payment);

        // Verify earning was created correctly
        assertNotNull(earning);
        assertNotNull(earning.getId());
        assertEquals(doctor.getId(), earning.getDoctor().getId());
        assertEquals(payment.getId(), earning.getChatPayment().getId());
        assertEquals(BigDecimal.valueOf(100.0), earning.getTotalAmount());
        assertEquals(BigDecimal.valueOf(70), earning.getCommissionPercentage());
        assertEquals(BigDecimal.valueOf(70.0), earning.getDoctorEarning());
        assertEquals(BigDecimal.valueOf(30.0), earning.getPlatformFee());
        assertEquals(DoctorEarning.EarningStatus.PENDING, earning.getStatus());
        assertNotNull(earning.getCreatedAt());
    }

    @Test
    void testConfirmEarning() {
        // Create and save an earning
        ChatRequest chatRequest = ChatRequest.builder()
                .patient(patient)
                .doctor(doctor)
                .status(RequestStatus.APPROVED)
                .build();
        chatRequest = chatRequestRepository.save(chatRequest);

        ChatPayment payment = ChatPayment.builder()
                .chatRequest(chatRequest)
                .amount(200.0)
                .hours(2)
                .expiresAt(LocalDateTime.now().plusHours(2))
                .build();
        payment = chatPaymentRepository.save(payment);

        DoctorEarning earning = doctorEarningService.createEarningFromPayment(payment);

        // Verify doctor's initial balance
        assertEquals(0.0, doctor.getDoctorBalance());

        // Confirm the earning
        DoctorEarning confirmedEarning = doctorEarningService.confirmEarning(earning.getId());

        // Verify earning status is updated
        assertEquals(DoctorEarning.EarningStatus.CONFIRMED, confirmedEarning.getStatus());
        assertNotNull(confirmedEarning.getConfirmedAt());

        // Verify doctor's balance is updated
        User updatedDoctor = userRepository.findById(doctor.getId()).orElse(null);
        assertNotNull(updatedDoctor);
        assertEquals(140.0, updatedDoctor.getDoctorBalance()); // 70% of 200 VND
    }

    @Test
    void testGetDoctorEarnings() {
        // Create multiple earnings for the doctor
        for (int i = 1; i <= 3; i++) {
            ChatRequest chatRequest = ChatRequest.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .status(RequestStatus.APPROVED)
                    .build();
            chatRequest = chatRequestRepository.save(chatRequest);

            ChatPayment payment = ChatPayment.builder()
                    .chatRequest(chatRequest)
                    .amount(100.0 * i)
                    .hours(i)
                    .expiresAt(LocalDateTime.now().plusHours(i))
                    .build();
            payment = chatPaymentRepository.save(payment);

            doctorEarningService.createEarningFromPayment(payment);
        }

        // Get doctor's earnings
        List<DoctorEarning> earnings = doctorEarningService.getDoctorEarnings(doctor);

        // Verify
        assertEquals(3, earnings.size());
    }

    @Test
    void testGetDoctorTotalEarnings() {
        // Create and confirm multiple earnings
        for (int i = 1; i <= 2; i++) {
            ChatRequest chatRequest = ChatRequest.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .status(RequestStatus.APPROVED)
                    .build();
            chatRequest = chatRequestRepository.save(chatRequest);

            ChatPayment payment = ChatPayment.builder()
                    .chatRequest(chatRequest)
                    .amount(100.0 * i)
                    .hours(i)
                    .expiresAt(LocalDateTime.now().plusHours(i))
                    .build();
            payment = chatPaymentRepository.save(payment);

            DoctorEarning earning = doctorEarningService.createEarningFromPayment(payment);
            doctorEarningService.confirmEarning(earning.getId());
        }

        // Get total confirmed earnings
        BigDecimal totalEarnings = doctorEarningService.getDoctorTotalConfirmedEarnings(doctor);

        // Verify: (70% of 100) + (70% of 200) = 70 + 140 = 210
        assertEquals(BigDecimal.valueOf(210.0), totalEarnings);
    }
}

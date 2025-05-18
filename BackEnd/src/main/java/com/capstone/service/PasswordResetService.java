package com.capstone.service;

import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Sends a password reset email to the user
     * @param email User's email address
     */
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // Generate a unique reset token
        String resetToken = UUID.randomUUID().toString();
        
        // Set token expiry to 1 hour from now
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.HOUR, 1);
        Date tokenExpiry = calendar.getTime();
        
        // Save the token and expiry in the user entity
        user.setVerificationToken(resetToken);
        user.setVerificationTokenExpiry(tokenExpiry);
        userRepository.save(user);
        
        // Send email with reset link
        emailService.sendPasswordResetEmail(email, resetToken);
    }

    /**
     * Verifies if a reset token is valid
     * @param token The reset token
     * @return true if token is valid, false otherwise
     */
    public boolean verifyResetToken(String token) {
        return userRepository.findByVerificationToken(token)
                .map(user -> {
                    // Check if token is expired
                    if (user.getVerificationTokenExpiry().before(new Date())) {
                        return false;
                    }
                    return true;
                })
                .orElse(false);
    }

    /**
     * Resets the user's password using a valid token
     * @param token The reset token
     * @param newPassword The new password
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN));
        
        // Check if token is expired
        if (user.getVerificationTokenExpiry().before(new Date())) {
            throw new AppException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        
        // Clear token data
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        
        userRepository.save(user);
        
        log.info("Password reset successful for user: {}", user.getUsername());
    }
} 
package com.capstone.controller;

import com.capstone.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/db")
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/migrate-email-verification")
    public ApiResponse<String> migrateEmailVerification() {
        try {
            // Check if the columns exist
            boolean verificationTokenExists = checkColumnExists("verification_token");
            boolean verificationTokenExpiryExists = checkColumnExists("verification_token_expiry");
            boolean emailVerifiedExists = checkColumnExists("email_verified");
            
            // Add columns if they don't exist
            if (!verificationTokenExists) {
                log.info("Adding verification_token column");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN verification_token VARCHAR(255)");
            }
            
            if (!verificationTokenExpiryExists) {
                log.info("Adding verification_token_expiry column");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN verification_token_expiry TIMESTAMP");
            }
            
            if (!emailVerifiedExists) {
                log.info("Adding email_verified column");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN");
            }
            
            // Update all existing users to have email_verified = true
            int updatedRows = jdbcTemplate.update("UPDATE users SET email_verified = true WHERE email_verified IS NULL");
            log.info("Updated {} rows with email_verified = true", updatedRows);
            
            return ApiResponse.<String>builder()
                    .result("Email verification columns migration completed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Migration failed", e);
            return ApiResponse.<String>builder()
                    .result("Migration failed: " + e.getMessage())
                    .build();
        }
    }
    
    private boolean checkColumnExists(String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = ?)",
            Boolean.class,
            columnName
        ));
    }
    
    @PostMapping("/migrate-refund-fields")
    public ApiResponse<String> migrateRefundFields() {
        try {
            // Check if the refund columns exist in chat_payments table
            boolean refundedExists = checkRefundColumnExists("refunded");
            boolean refundAmountExists = checkRefundColumnExists("refund_amount");
            boolean refundReasonExists = checkRefundColumnExists("refund_reason");
            boolean refundedAtExists = checkRefundColumnExists("refunded_at");
            
            // Add columns if they don't exist
            if (!refundedExists) {
                log.info("Adding refunded column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refunded BOOLEAN NOT NULL DEFAULT FALSE");
            }
            
            if (!refundAmountExists) {
                log.info("Adding refund_amount column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refund_amount DOUBLE PRECISION");
            }
            
            if (!refundReasonExists) {
                log.info("Adding refund_reason column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refund_reason VARCHAR(500)");
            }
            
            if (!refundedAtExists) {
                log.info("Adding refunded_at column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refunded_at TIMESTAMP");
            }
            
            // Update all existing payments to have refunded = false if null
            int updatedRows = jdbcTemplate.update("UPDATE chat_payments SET refunded = false WHERE refunded IS NULL");
            log.info("Updated {} rows with refunded = false", updatedRows);
            
            return ApiResponse.<String>builder()
                    .result("Refund fields migration completed successfully")
                    .build();
        } catch (Exception e) {
            log.error("Refund migration failed", e);
            return ApiResponse.<String>builder()
                    .result("Refund migration failed: " + e.getMessage())
                    .build();
        }
    }
      private boolean checkRefundColumnExists(String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_payments' AND column_name = ?)",
            Boolean.class,
            columnName
        ));
    }
}
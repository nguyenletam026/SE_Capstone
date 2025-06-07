package com.capstone.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
@Slf4j
public class RefundSchemaMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting refund schema migration...");
        
        try {
            // Check and add refunded column
            if (!checkColumnExists("refunded")) {
                log.info("Adding refunded column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refunded BOOLEAN DEFAULT FALSE");
            } else {
                log.info("refunded column already exists");
            }
            
            // Check and add refund_amount column
            if (!checkColumnExists("refund_amount")) {
                log.info("Adding refund_amount column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refund_amount DOUBLE PRECISION");
            } else {
                log.info("refund_amount column already exists");
            }
            
            // Check and add refund_reason column
            if (!checkColumnExists("refund_reason")) {
                log.info("Adding refund_reason column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refund_reason VARCHAR(500)");
            } else {
                log.info("refund_reason column already exists");
            }
            
            // Check and add refunded_at column
            if (!checkColumnExists("refunded_at")) {
                log.info("Adding refunded_at column to chat_payments table");
                jdbcTemplate.execute("ALTER TABLE chat_payments ADD COLUMN refunded_at TIMESTAMP");
            } else {
                log.info("refunded_at column already exists");
            }
            
            // Update all existing records to have refunded = false if they are null
            int updatedRows = jdbcTemplate.update("UPDATE chat_payments SET refunded = false WHERE refunded IS NULL");
            log.info("Updated {} rows with refunded = false", updatedRows);
            
            // Make the refunded column NOT NULL
            try {
                jdbcTemplate.execute("ALTER TABLE chat_payments ALTER COLUMN refunded SET NOT NULL");
                log.info("Set refunded column to NOT NULL");
            } catch (Exception e) {
                log.warn("Failed to set refunded column to NOT NULL (may already be set): {}", e.getMessage());
            }
            
            log.info("Refund schema migration completed successfully!");
            
        } catch (Exception e) {
            log.error("Refund schema migration failed: ", e);
            throw e;
        }
    }
    
    private boolean checkColumnExists(String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
            "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_payments' AND column_name = ?)",
            Boolean.class,
            columnName
        ));
    }
}

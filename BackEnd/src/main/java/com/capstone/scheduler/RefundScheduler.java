package com.capstone.scheduler;

import com.capstone.configuration.RefundConfigurationProperties;
import com.capstone.service.RefundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for automatic refund processing
 * Runs based on configuration to check for payments that need refunds due to doctor non-responsiveness
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "refund.scheduler.enabled", havingValue = "true", matchIfMissing = true)
public class RefundScheduler {

    private final RefundService refundService;
    private final RefundConfigurationProperties refundConfig;    /**
     * Check for payments that need refunds based on configuration interval
     * This ensures timely processing without overwhelming the system
     */
    @Scheduled(fixedRateString = "#{@refundConfigurationProperties.scheduler.checkInterval}")
    public void processAutomaticRefunds() {
        if (!refundConfig.getScheduler().isEnabled()) {
            log.debug("Refund scheduler is disabled");
            return;
        }
        
        try {
            log.info("Starting automatic refund processing...");
            int processedRefunds = refundService.processRefundForUnresponsiveDoctors();
            
            if (processedRefunds > 0) {
                log.info("Processed {} automatic refunds for unresponsive doctors", processedRefunds);
            } else {
                log.debug("No refunds needed at this time");
            }
        } catch (Exception e) {
            log.error("Error occurred during automatic refund processing", e);
        }
    }

    /**
     * Weekly report on refund statistics
     * Runs every Sunday at 6 AM
     */
    @Scheduled(cron = "0 0 6 * * SUN")
    public void generateWeeklyRefundReport() {
        try {
            log.info("Generating weekly refund report...");
            // This could be expanded to send reports to administrators
            refundService.generateRefundStatistics();
        } catch (Exception e) {
            log.error("Error occurred while generating weekly refund report", e);
        }
    }
}

package com.capstone.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Configuration properties for refund settings
 */
@Configuration
@ConfigurationProperties(prefix = "refund")
@Data
public class RefundConfigurationProperties {
    
    /**
     * Timeout before considering refund (in minutes)
     */
    private int doctorResponseTimeout = 30;
    
    /**
     * Refund percentages based on reason
     */
    private Map<String, Integer> percentages = Map.of(
            "doctor-no-response", 100,
            "manual-admin", 100,
            "patient-request", 80,
            "technical-issue", 100,
            "default", 50
    );
    
    /**
     * Enable/disable automatic refunds
     */
    private boolean autoRefundEnabled = true;
    
    /**
     * Scheduler settings
     */
    private Scheduler scheduler = new Scheduler();
      /**
     * Notification settings
     */
    private Notifications notifications = new Notifications();
    
    /**
     * Doctor warning thresholds
     */
    private DoctorWarningThresholds doctorWarningThresholds = new DoctorWarningThresholds();
    
    @Data
    public static class Scheduler {
        /**
         * How often to check for refunds (in milliseconds)
         */
        private long checkInterval = 600000L; // 10 minutes
        
        /**
         * Enable/disable scheduled refund checks
         */
        private boolean enabled = true;
    }
    
    @Data
    public static class Notifications {
        /**
         * Enable patient notifications
         */
        private boolean notifyPatients = true;
        
        /**
         * Enable doctor warnings
         */
        private boolean notifyDoctors = true;
        
        /**
         * Email notifications (if email service is available)
         */
        private boolean emailEnabled = false;    }
    
    @Data
    public static class DoctorWarningThresholds {
        /**
         * Mild warning threshold (number of refunds in past 30 days)
         */
        private int mild = 3;
        
        /**
         * Moderate warning threshold (number of refunds in past 30 days)
         */
        private int moderate = 5;
        
        /**
         * Severe warning threshold (number of refunds in past 30 days)
         */
        private int severe = 8;
    }
    
    /**
     * Get refund percentage for a specific reason
     */
    public int getRefundPercentage(String reason) {
        return percentages.getOrDefault(reason, percentages.get("default"));
    }
}

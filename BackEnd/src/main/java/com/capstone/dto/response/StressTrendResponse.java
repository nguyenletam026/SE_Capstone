package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StressTrendResponse {
    private double current_average_stress;
    private double previous_average_stress;
    private double stress_change_percentage;
    private String trend_direction; // "INCREASING", "DECREASING", "STABLE"
    private boolean is_concerning; // true if stress is consistently increasing
    private List<StressPeriodData> trend_data;
    private Date start_date;
    private Date end_date;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StressPeriodData {
        private Date date;
        private double average_stress_score;
        private String dominant_stress_level;
        private int total_analyses;
        private double change_from_previous; // percentage change from previous period
    }
} 
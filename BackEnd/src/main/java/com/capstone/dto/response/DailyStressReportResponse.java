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
public class DailyStressReportResponse {
    private double average_stress_score;
    private String dominant_stress_level;
    private Date end_date;
    private Date start_date;
    private int total_analyses;
    private List<StressAnalysisResponse> stress_analyses;
} 
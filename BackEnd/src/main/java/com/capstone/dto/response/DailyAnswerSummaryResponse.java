package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DailyAnswerSummaryResponse {
    private LocalDateTime date;
    private Double averageStressScore;
    private String overallStressLevel;
    private List<AnswerResponse> answers;
    private boolean isCompleted;
} 
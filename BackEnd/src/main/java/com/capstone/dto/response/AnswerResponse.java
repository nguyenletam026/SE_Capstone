package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerResponse {
    private String id;
    private Integer selectedOptionIndex;
    private String selectedOptionText;
    private String questionId;
    private String questionContent;
    private List<String> questionOptions;
    private String userId;
    private String username;
    private Double stressScore;
    private String stressLevel;
    private LocalDateTime createdAt;
} 
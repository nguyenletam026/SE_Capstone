package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentStressDto {
    private String studentId;
    private String studentName;
    private String username;
    private String stressLevel; // Daily average stress level
    private double dailyAverageStressScore; // Daily average stress score
    private Date lastUpdated;
    private String className;
    private int totalAnalysesToday; // Number of analyses today
}
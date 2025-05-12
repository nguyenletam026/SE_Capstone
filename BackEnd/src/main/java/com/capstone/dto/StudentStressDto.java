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
    private String stressLevel;
    private Date lastUpdated;
    private String className;
} 
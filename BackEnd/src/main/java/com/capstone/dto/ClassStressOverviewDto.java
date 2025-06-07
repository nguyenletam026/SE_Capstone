package com.capstone.dto;

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
public class ClassStressOverviewDto {
    private String classId;
    private String className;
    private double classAverageStressScore;
    private String classStressLevel; // HIGH, MEDIUM, LOW based on average
    private int totalStudents;
    private int studentsWithHighStress;
    private int studentsWithMediumStress;
    private int studentsWithLowStress;
    private int studentsWithNoData;
    private String trend; // INCREASING, DECREASING, STABLE
    private Date lastUpdated;
    private List<StudentStressDto> students;
    
    // Stress level assessment
    public boolean isHighStressClass() {
        return studentsWithHighStress > 0 && 
               (double) studentsWithHighStress / totalStudents > 0.3; // More than 30% high stress
    }
    
    public boolean isLowStressClass() {
        return studentsWithHighStress == 0 && 
               (double) studentsWithLowStress / totalStudents > 0.7; // More than 70% low stress
    }
}

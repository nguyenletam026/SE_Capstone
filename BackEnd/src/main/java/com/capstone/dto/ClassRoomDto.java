package com.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassRoomDto {
    private String id;
    private String name;
    private String description;
    private String teacherId;
    private String teacherName;
    private LocalDateTime createdAt;
    private List<StudentDto> students;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentDto {
        private String id;
        private String name;
        private String username;
    }
} 
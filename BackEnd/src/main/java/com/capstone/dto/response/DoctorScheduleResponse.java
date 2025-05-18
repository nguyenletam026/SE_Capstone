package com.capstone.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorScheduleResponse {
    private String id;
    private String doctorId;
    private String doctorName;
    private String specialization;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxAppointments;
    private Integer currentAppointments;
    private String notes;
    private Boolean isAvailable;
} 
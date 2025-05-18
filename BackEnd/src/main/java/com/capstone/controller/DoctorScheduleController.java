package com.capstone.controller;

import com.capstone.dto.request.DoctorScheduleRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.DoctorScheduleResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.DoctorSchedule;
import com.capstone.entity.User;
import com.capstone.mapper.UserMapper;
import com.capstone.service.DoctorScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor-schedules")
@RequiredArgsConstructor
public class DoctorScheduleController {

    private final DoctorScheduleService doctorScheduleService;
    private final UserMapper userMapper;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> createSchedule(@RequestBody DoctorScheduleRequest request) {
        DoctorScheduleResponse response = doctorScheduleService.createSchedule(request);
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponse>builder()
                .result(response)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getAllSchedules() {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.getAllSchedules();
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .result(schedules)
                .build());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedulesByDoctorId(@PathVariable String doctorId) {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.getSchedulesByDoctorId(doctorId);
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .result(schedules)
                .build());
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedulesByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.getSchedulesByDate(date);
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .result(schedules)
                .build());
    }

    @GetMapping("/date/{date}/doctors")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getDoctorsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        System.out.println("Controller: Getting doctors for date: " + date);
        List<User> doctors = doctorScheduleService.getDoctorsByDate(date);
        System.out.println("Controller: Found " + doctors.size() + " doctors for date " + date);
        
        List<UserResponse> doctorResponses = doctors.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
        
        System.out.println("Controller: Returning " + doctorResponses.size() + " doctor responses");
        
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .result(doctorResponses)
                .build());
    }

    @GetMapping("/date/{date}/time/{time}/doctors")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getDoctorsByDateTime(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) java.time.LocalTime time) {
        System.out.println("Controller: Getting doctors for date: " + date + " and time: " + time);
        
        // Use the new service method to get doctors by date and time
        List<User> doctors = doctorScheduleService.getDoctorsByDateTime(date, time);
        
        System.out.println("Controller: Found " + doctors.size() + " doctors for date " + date + " and time " + time);
        
        List<UserResponse> doctorResponses = doctors.stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.<List<UserResponse>>builder()
                .result(doctorResponses)
                .build());
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getSchedulesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DoctorScheduleResponse> schedules = doctorScheduleService.getSchedulesByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.<List<DoctorScheduleResponse>>builder()
                .result(schedules)
                .build());
    }

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorScheduleResponse>> updateSchedule(
            @PathVariable String scheduleId,
            @RequestBody DoctorScheduleRequest request) {
        DoctorScheduleResponse response = doctorScheduleService.updateSchedule(scheduleId, request);
        return ResponseEntity.ok(ApiResponse.<DoctorScheduleResponse>builder()
                .result(response)
                .build());
    }

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteSchedule(@PathVariable String scheduleId) {
        doctorScheduleService.deleteSchedule(scheduleId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .result("Schedule deleted successfully")
                .build());
    }
} 
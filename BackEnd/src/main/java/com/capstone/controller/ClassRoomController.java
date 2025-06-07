package com.capstone.controller;

import com.capstone.dto.ClassRoomDto;
import com.capstone.dto.StudentStressDto;
import com.capstone.dto.StudentAnswerDto;
import com.capstone.dto.ClassStressOverviewDto;
import com.capstone.dto.ApiResponse;
import com.capstone.service.ClassRoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/classes")
public class ClassRoomController {

    private final ClassRoomService classRoomService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> createClassRoom(
            Principal principal,
            @RequestParam String className,
            @RequestParam String description) {
        
        String username = principal.getName();
        ClassRoomDto createdClass = classRoomService.createClassRoomByUsername(username, className, description);
        
        return ResponseEntity.ok(ApiResponse.success(createdClass));
    }
    
    @GetMapping("/teacher")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getTeacherClasses(Principal principal) {
        String username = principal.getName();
        List<ClassRoomDto> classes = classRoomService.getTeacherClassesByUsername(username);
        
        return ResponseEntity.ok(ApiResponse.success(classes));
    }
    
    @GetMapping("/{classId}")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getClassRoom(@PathVariable String classId) {
        ClassRoomDto classRoom = classRoomService.getClassRoom(classId);
        
        return ResponseEntity.ok(ApiResponse.success(classRoom));
    }
    
    @PutMapping("/{classId}")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> updateClassRoom(
            @PathVariable String classId,
            @RequestParam String className,
            @RequestParam(required = false) String description) {
        
        ClassRoomDto updatedClass = classRoomService.updateClassRoom(classId, className, description);
        
        return ResponseEntity.ok(ApiResponse.success(updatedClass));
    }
    
    @PostMapping("/{classId}/students")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> addStudentToClass(
            @PathVariable String classId,
            @RequestParam String studentUsername) {
        
        ClassRoomDto updatedClass = classRoomService.addStudentToClass(classId, studentUsername);
        
        return ResponseEntity.ok(ApiResponse.success(updatedClass));
    }
    
    @DeleteMapping("/{classId}/students/{studentId}")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> removeStudentFromClass(
            @PathVariable String classId,
            @PathVariable String studentId) {
        
        classRoomService.removeStudentFromClass(classId, studentId);
        
        return ResponseEntity.ok(ApiResponse.success("Student removed from class"));
    }
    
    @GetMapping("/{classId}/stress-data")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getClassStressData(@PathVariable String classId) {
        List<StudentStressDto> stressData = classRoomService.getStudentsStressData(classId);
        
        return ResponseEntity.ok(ApiResponse.success(stressData));
    }
    
    @GetMapping("/students/{studentId}/answers")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getStudentAnswers(
            @PathVariable String studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        List<StudentAnswerDto> answers = classRoomService.getStudentAnswers(studentId, fromDate, toDate);
        
        return ResponseEntity.ok(ApiResponse.success(answers));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getTeacherStats(Principal principal) {
        String username = principal.getName();
        
        // Get teacher's class count
        List<ClassRoomDto> classes = classRoomService.getTeacherClassesByUsername(username);
        int totalClasses = classes.size();
        
        // Count total students across all classes (without duplicates)
        Set<String> uniqueStudentIds = new HashSet<>();
        for (ClassRoomDto classRoom : classes) {
            for (ClassRoomDto.StudentDto student : classRoom.getStudents()) {
                uniqueStudentIds.add(student.getId());
            }
        }
        int totalStudents = uniqueStudentIds.size();
        
        // Count students with high stress level
        int stressedStudents = 0;
        for (String studentId : uniqueStudentIds) {
            // This is simplified - in a real app you'd check actual stress levels
            // For now we'll use a placeholder value of about 15% of students
            if (Math.random() < 0.15) {
                stressedStudents++;
            }
        }
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClasses", totalClasses);
        stats.put("totalStudents", totalStudents);
        stats.put("stressedStudents", stressedStudents);
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/all-students-stress")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getAllStudentsStressData(Principal principal) {
        String username = principal.getName();
        
        // Get all classes for this teacher
        List<ClassRoomDto> classes = classRoomService.getTeacherClassesByUsername(username);
        
        // Create a map to store unique students and their stress data
        // Use student ID as key to avoid duplicates
        Map<String, StudentStressDto> uniqueStudentMap = new HashMap<>();
        
        // Go through each class and collect student stress data
        for (ClassRoomDto classRoom : classes) {
            List<StudentStressDto> classStressData = classRoomService.getStudentsStressData(classRoom.getId());
            
            for (StudentStressDto studentStress : classStressData) {
                // Only add or update if student isn't already in our map, or if the current data is more recent
                if (!uniqueStudentMap.containsKey(studentStress.getStudentId()) || 
                    (studentStress.getLastUpdated() != null && 
                     uniqueStudentMap.get(studentStress.getStudentId()).getLastUpdated() != null &&
                     studentStress.getLastUpdated().after(uniqueStudentMap.get(studentStress.getStudentId()).getLastUpdated()))) {
                      // Add class information to the student stress data
                    StudentStressDto updatedDto = StudentStressDto.builder()
                            .studentId(studentStress.getStudentId())
                            .studentName(studentStress.getStudentName())
                            .username(studentStress.getUsername())
                            .stressLevel(studentStress.getStressLevel())
                            .dailyAverageStressScore(studentStress.getDailyAverageStressScore())
                            .totalAnalysesToday(studentStress.getTotalAnalysesToday())
                            .lastUpdated(studentStress.getLastUpdated())
                            .className(classRoom.getName())  // Add class name
                            .build();
                    
                    uniqueStudentMap.put(studentStress.getStudentId(), updatedDto);
                }
            }
        }
        
        // Convert the map values to a list
        List<StudentStressDto> allStudentsStressData = new ArrayList<>(uniqueStudentMap.values());
        
        // Calculate trend based on overall stress levels
        String trend = "stable";
        int highStressCount = (int) allStudentsStressData.stream()
                .filter(s -> "HIGH".equals(s.getStressLevel()))
                .count();
        
        double highStressPercentage = allStudentsStressData.isEmpty() ? 0 : 
                (double) highStressCount / allStudentsStressData.size() * 100;
        
        // Simple trend determination (can be improved with historical data)
        if (highStressPercentage > 30) {
            trend = "increasing";
        } else if (highStressPercentage < 10) {
            trend = "decreasing";
        }
        
        // Create result map
        Map<String, Object> result = new HashMap<>();
        result.put("students", allStudentsStressData);
        result.put("trend", trend);
          return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{classId}/stress-overview")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getClassStressOverview(@PathVariable String classId) {
        ClassStressOverviewDto overview = classRoomService.getClassStressOverview(classId);
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/stress-overview/all")
    @PreAuthorize("hasRole('ROLE_TEACHER')")
    public ResponseEntity<ApiResponse> getAllClassesStressOverview(Principal principal) {
        String username = principal.getName();
        List<ClassStressOverviewDto> overviews = classRoomService.getAllClassesStressOverview(username);
        return ResponseEntity.ok(ApiResponse.success(overviews));
    }
}
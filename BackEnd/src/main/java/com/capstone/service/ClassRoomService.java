package com.capstone.service;

import com.capstone.dto.ClassRoomDto;
import com.capstone.dto.StudentStressDto;
import com.capstone.dto.StudentAnswerDto;
import com.capstone.dto.ClassStressOverviewDto;
import com.capstone.entity.ClassRoom;
import com.capstone.entity.StressAnalysis;
import com.capstone.entity.Answer;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClassRoomService {
    
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private final StressAnalysisRepository stressAnalysisRepository;
    private final AnswerRepository answerRepository;
    private final RoleRepository roleRepository;
    
    @Transactional
    public ClassRoomDto createClassRoom(String teacherId, String className, String description) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (!teacher.getRole().getName().equals("TEACHER")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        ClassRoom classRoom = ClassRoom.builder()
                .name(className)
                .description(description)
                .teacher(teacher)
                .build();
        
        ClassRoom savedClassRoom = classRoomRepository.save(classRoom);
        
        return mapToClassRoomDto(savedClassRoom);
    }
    
    @Transactional
    public ClassRoomDto addStudentToClass(String classId, String studentUsername) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        User student = userRepository.findByUsername(studentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (!student.getRole().getName().equals("USER")) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        classRoom.getStudents().add(student);
        classRoomRepository.save(classRoom);
        
        return mapToClassRoomDto(classRoom);
    }
    
    @Transactional
    public void removeStudentFromClass(String classId, String studentId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        classRoom.getStudents().remove(student);
        classRoomRepository.save(classRoom);
    }
    
    public ClassRoomDto getClassRoom(String classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        return mapToClassRoomDto(classRoom);
    }
    
    public List<ClassRoomDto> getTeacherClasses(String teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        List<ClassRoom> classRooms = classRoomRepository.findByTeacher(teacher);
        
        return classRooms.stream()
                .map(this::mapToClassRoomDto)
                .collect(Collectors.toList());
    }
    
    public List<StudentStressDto> getStudentsStressData(String classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        List<StudentStressDto> studentStressDtos = new ArrayList<>();
        
        // Get today's date range
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);
        Date todayStart = Date.from(startOfDay.atZone(ZoneId.systemDefault()).toInstant());
        Date todayEnd = Date.from(endOfDay.atZone(ZoneId.systemDefault()).toInstant());
        
        for (User student : classRoom.getStudents()) {
            // Get today's stress analyses for the student
            List<StressAnalysis> todayAnalyses = stressAnalysisRepository
                    .findByUserAndCreatedAtBetween(student, todayStart, todayEnd);
            
            double dailyAverageScore = 0.0;
            String dailyAverageLevel = "NO_DATA";
            Date lastUpdated = null;
            
            if (!todayAnalyses.isEmpty()) {
                // Calculate daily average stress score
                dailyAverageScore = todayAnalyses.stream()
                        .mapToDouble(StressAnalysis::getStressScore)
                        .average()
                        .orElse(0.0);
                
                // Map average score to level
                dailyAverageLevel = mapStressScoreToLevel(dailyAverageScore);
                
                // Get the most recent analysis timestamp
                lastUpdated = todayAnalyses.stream()
                        .map(StressAnalysis::getCreatedAt)
                        .max(Date::compareTo)
                        .orElse(null);
            }
            
            StudentStressDto dto = StudentStressDto.builder()
                    .studentId(student.getId())
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .username(student.getUsername())
                    .stressLevel(dailyAverageLevel)
                    .dailyAverageStressScore(dailyAverageScore)
                    .totalAnalysesToday(todayAnalyses.size())
                    .lastUpdated(lastUpdated)
                    .build();
            
            studentStressDtos.add(dto);
        }
        
        return studentStressDtos;
    }
    
    public List<StudentAnswerDto> getStudentAnswers(String studentId, LocalDate fromDate, LocalDate toDate) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.plusDays(1).atStartOfDay();
        
        // Use available method from AnswerRepository
        List<Answer> answers = answerRepository.findByUserOrderByCreatedAtDesc(student)
                .stream()
                .filter(answer -> {
                    LocalDateTime answerTime = answer.getCreatedAt();
                    return answerTime.isAfter(fromDateTime) && answerTime.isBefore(toDateTime);
                })
                .toList();
        
        return answers.stream()
                .map(answer -> StudentAnswerDto.builder()
                        .answerId(answer.getId())
                        .questionId(answer.getQuestion().getId())
                        .questionText(answer.getQuestion().getContent())
                        .answerText(answer.getSelectedOptionText())
                        .answerDate(java.util.Date.from(answer.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant()))
                        .build()
                )
                .collect(Collectors.toList());
    }
    
    public User     createTeacherAccount(String firstName, String lastName, String username, String password) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        
        // Get the TEACHER role
        var teacherRole = roleRepository.findByName("TEACHER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        
        // Create the teacher user with encrypted password
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        String encryptedPassword = passwordEncoder.encode(password);
        
        User teacher = User.builder()
                .username(username)
                .password(encryptedPassword)
                .firstName(firstName)
                .lastName(lastName)
                .role(teacherRole)
                .balance(0.0)
                .emailVerified(true)
                .build();
        
        return userRepository.save(teacher);
    }
    
    @Transactional
    public ClassRoomDto createClassRoomByUsername(String username, String className, String description) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (!teacher.getRole().getName().equals("TEACHER")) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        ClassRoom classRoom = ClassRoom.builder()
                .name(className)
                .description(description)
                .teacher(teacher)
                .build();
        
        ClassRoom savedClassRoom = classRoomRepository.save(classRoom);
        
        return mapToClassRoomDto(savedClassRoom);
    }
    
    public List<ClassRoomDto> getTeacherClassesByUsername(String username) {
        User teacher = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        List<ClassRoom> classRooms = classRoomRepository.findByTeacher(teacher);
        
        return classRooms.stream()
                .map(this::mapToClassRoomDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ClassRoomDto updateClassRoom(String classId, String className, String description) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        classRoom.setName(className);
        classRoom.setDescription(description);
        
        ClassRoom updatedClassRoom = classRoomRepository.save(classRoom);
        
        return mapToClassRoomDto(updatedClassRoom);
    }
    
    public ClassStressOverviewDto getClassStressOverview(String classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        
        List<StudentStressDto> studentStressList = getStudentsStressData(classId);
        
        // Calculate class-level statistics
        int totalStudents = studentStressList.size();
        int highStressCount = 0;
        int mediumStressCount = 0;
        int lowStressCount = 0;
        int noDataCount = 0;
        
        double totalScore = 0.0;
        int studentsWithData = 0;
        Date latestUpdate = null;
        
        for (StudentStressDto student : studentStressList) {
            String level = student.getStressLevel();
            switch (level) {
                case "HIGH":
                case "EXTREME_STRESS":
                    highStressCount++;
                    break;
                case "MEDIUM":
                    mediumStressCount++;
                    break;
                case "LOW":
                case "VERY_LOW":
                    lowStressCount++;
                    break;
                default:
                    noDataCount++;
                    break;
            }
            
            if (student.getDailyAverageStressScore() > 0) {
                totalScore += student.getDailyAverageStressScore();
                studentsWithData++;
            }
            
            if (student.getLastUpdated() != null && 
                (latestUpdate == null || student.getLastUpdated().after(latestUpdate))) {
                latestUpdate = student.getLastUpdated();
            }
        }
        
        double classAverageScore = studentsWithData > 0 ? totalScore / studentsWithData : 0.0;
        String classStressLevel = mapStressScoreToLevel(classAverageScore);
        
        return ClassStressOverviewDto.builder()
                .classId(classId)
                .className(classRoom.getName())
                .classAverageStressScore(classAverageScore)
                .classStressLevel(classStressLevel)
                .totalStudents(totalStudents)
                .studentsWithHighStress(highStressCount)
                .studentsWithMediumStress(mediumStressCount)
                .studentsWithLowStress(lowStressCount)
                .studentsWithNoData(noDataCount)
                .trend("STABLE") // TODO: Implement trend calculation
                .lastUpdated(latestUpdate)
                .students(studentStressList)
                .build();
    }

    public List<ClassStressOverviewDto> getAllClassesStressOverview(String teacherUsername) {
        User teacher = userRepository.findByUsername(teacherUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        List<ClassRoom> teacherClasses = classRoomRepository.findByTeacher(teacher);
        
        return teacherClasses.stream()
                .map(classRoom -> getClassStressOverview(classRoom.getId()))
                .collect(Collectors.toList());
    }
    
    private ClassRoomDto mapToClassRoomDto(ClassRoom classRoom) {
        return ClassRoomDto.builder()
                .id(classRoom.getId())
                .name(classRoom.getName())
                .description(classRoom.getDescription())
                .teacherId(classRoom.getTeacher().getId())
                .teacherName(classRoom.getTeacher().getFirstName() + " " + classRoom.getTeacher().getLastName())
                .createdAt(classRoom.getCreatedAt())
                .students(
                        classRoom.getStudents().stream()
                                .map(student -> ClassRoomDto.StudentDto.builder()
                                        .id(student.getId())
                                        .name(student.getFirstName() + " " + student.getLastName())
                                        .username(student.getUsername())
                                        .build()
                                )
                                .collect(Collectors.toList())
                )
                .build();
    }

    private String mapStressScoreToLevel(double score) {
        if (score >= 85) {
            return "EXTREME_STRESS";
        } else if (score >= 70) {
            return "HIGH";
        } else if (score >= 50) {
            return "MEDIUM";
        } else if (score >= 30) {
            return "LOW";
        } else if (score >= 10) {
            return "VERY_LOW";
        } else {
            return "NO_DATA";
        }
    }
}
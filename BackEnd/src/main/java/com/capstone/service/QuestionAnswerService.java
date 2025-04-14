package com.capstone.service;

import com.capstone.dto.request.AnswerRequest;
import com.capstone.dto.request.QuestionRequest;
import com.capstone.dto.response.AnswerResponse;
import com.capstone.dto.response.DailyAnswerSummaryResponse;
import com.capstone.dto.response.QuestionResponse;
import com.capstone.entity.Answer;
import com.capstone.entity.Question;
import com.capstone.entity.User;
import com.capstone.enums.StressLevel;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.AnswerRepository;
import com.capstone.repository.QuestionRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Validated
@RequiredArgsConstructor

    public class QuestionAnswerService {
    @Value("${stress.extreme.threshold:85}")
    private double extremeStressThreshold;

    @Value("${stress.high.threshold:70}")
    private double highStressThreshold;

    @Value("${stress.moderate.threshold:50}")
    private double moderateStressThreshold;

    @Value("${stress.mild.threshold:30}")
    private double mildStressThreshold;

    @Value("${stress.normal.threshold:10}")
    private double normalStressThreshold;

    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;

    @Transactional
    public QuestionResponse createQuestion(@Valid QuestionRequest request) {
        User currentUser = getCurrentUser();
        
        validateQuestionRequest(request);
        
        Question question = Question.builder()
                .content(request.getContent())
                .options(new ArrayList<>(request.getOptions()))
                .optionStressScores(new ArrayList<>(request.getOptionStressScores()))
                .createdBy(currentUser)
                .createdAt(LocalDateTime.now())
                .build();
        
        question = questionRepository.save(question);
        log.info("Created new question with ID: {}", question.getId());
        
        return convertToQuestionResponse(question);
    }
    public String mapStressScoreToLevel(double score) {

        if (score >= extremeStressThreshold) {
            return StressLevel.EXTREME_STRESS.toString();
        } else if (score >= highStressThreshold) {
            return StressLevel.HIGH_STRESS.toString();
        } else if (score >= moderateStressThreshold) {
            return StressLevel.MODERATE_STRESS.toString();
        } else if (score >= mildStressThreshold) {
            return StressLevel.MILD_STRESS.toString();
        } else if (score >= normalStressThreshold) {
            return StressLevel.NORMAL.toString();
        } else {
            return StressLevel.RELAXED.toString();
        }
    }
    public List<QuestionResponse> getAllQuestions() {
        List<Question> questions = questionRepository.findAllByOrderByCreatedAtDesc();
        log.debug("Retrieved {} questions", questions.size());
        
        return questions.stream()
                .map(this::convertToQuestionResponse)
                .collect(Collectors.toList());
    }

    public QuestionResponse getQuestionById(String id) {
        Question question = findQuestionById(id);
        return convertToQuestionResponse(question);
    }

    @Transactional
    public AnswerResponse submitAnswer(@Valid AnswerRequest request) {

        User currentUser = getCurrentUser();
        Question question = findQuestionById(request.getQuestionId());
        
        validateAnswerSubmission(currentUser, question, request);
        
        String selectedOptionText = question.getOptions().get(request.getSelectedOptionIndex());
        double stressScore = question.getOptionStressScores().get(request.getSelectedOptionIndex());
        String stressLevel = mapStressScoreToLevel(stressScore);
        
        Answer answer = Answer.builder()
                .selectedOptionIndex(request.getSelectedOptionIndex())
                .selectedOptionText(selectedOptionText)
                .question(question)
                .user(currentUser)
                .stressScore(stressScore)
                .stressLevel(stressLevel)
                .createdAt(LocalDateTime.now())
                .build();
        
        answer = answerRepository.save(answer);

        
        return convertToAnswerResponse(answer);
    }

    public List<DailyAnswerSummaryResponse> getMyAnswers() {
        User currentUser = getCurrentUser();
        List<Answer> allAnswers = answerRepository.findByUserOrderByCreatedAtDesc(currentUser);
        
        Map<LocalDate, List<Answer>> answersByDay = allAnswers.stream()
                .collect(Collectors.groupingBy(
                    answer -> answer.getCreatedAt().toLocalDate(),
                    Collectors.toList()
                ));

        
        return answersByDay.entrySet().stream()
                .map(this::createDailySummary)
                .sorted(Comparator.comparing(DailyAnswerSummaryResponse::getDate).reversed())
                .collect(Collectors.toList());
    }

    public List<AnswerResponse> getAnswersByQuestionId(String questionId) {
        Question question = findQuestionById(questionId);
        List<Answer> answers = answerRepository.findByQuestionOrderByCreatedAtDesc(question);
        
        log.debug("Retrieved {} answers for question {}", answers.size(), questionId);
        return answers.stream()
                .map(this::convertToAnswerResponse)
                .collect(Collectors.toList());
    }

    public AnswerResponse getAnswerById(String id) {
        Answer answer = answerRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Answer not found with ID: {}", id);
                    return new AppException(ErrorCode.RESOURCE_NOT_FOUND);
                });
        
        return convertToAnswerResponse(answer);
    }
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found: {}", username);
                    return new AppException(ErrorCode.USER_NOT_EXISTED);
                });
    }
    
    private Question findQuestionById(String id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Question not found with ID: {}", id);
                    return new AppException(ErrorCode.RESOURCE_NOT_FOUND);
                });
    }
    
    private void validateQuestionRequest(QuestionRequest request) {
        if (request.getOptions() == null || request.getOptions().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        if (request.getOptionStressScores() == null || request.getOptionStressScores().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        
        if (request.getOptions().size() != request.getOptionStressScores().size()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
    
    private void validateAnswerSubmission(User user, Question question, AnswerRequest request) {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        List<Answer> todayAnswers = answerRepository.findByUserAndCreatedAtAfter(user, startOfDay);
        
        Set<String> answeredQuestionIds = todayAnswers.stream()
                .map(answer -> answer.getQuestion().getId())
                .collect(Collectors.toSet());
        
        if (answeredQuestionIds.contains(question.getId())) {
            log.warn("User {} attempted to answer question {} multiple times in one day", user.getUsername(), question.getId());
            throw new AppException(ErrorCode.DUPLICATE_RESOURCE);
        }
        
        long totalQuestions = questionRepository.count();
        if (answeredQuestionIds.size() >= totalQuestions) {
            log.warn("User {} attempted to exceed daily question limit", user.getUsername());
            throw new AppException(ErrorCode.DAILY_LIMIT_EXCEEDED);
        }
        
        if (request.getSelectedOptionIndex() < 0 || request.getSelectedOptionIndex() >= question.getOptions().size()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
    }
    
    final DailyAnswerSummaryResponse createDailySummary(Map.Entry<LocalDate, List<Answer>> entry) {
        List<Answer> dayAnswers = entry.getValue();
        
        double avgStressScore = dayAnswers.stream()
                .mapToDouble(Answer::getStressScore)
                .average()
                .orElse(0.0);

        String overallStressLevel = mapStressScoreToLevel(avgStressScore);
        long totalQuestions = questionRepository.count();
        boolean isCompleted = dayAnswers.size() >= totalQuestions;

        return DailyAnswerSummaryResponse.builder()
                .date(entry.getKey().atStartOfDay())
                .averageStressScore(avgStressScore)
                .overallStressLevel(overallStressLevel)
                .answers(dayAnswers.stream()
                        .map(this::convertToAnswerResponse)
                        .collect(Collectors.toList()))
                .isCompleted(isCompleted)
                .build();
    }
    
    private QuestionResponse convertToQuestionResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .content(question.getContent())
                .options(new ArrayList<>(question.getOptions()))
                .createdBy(question.getCreatedBy().getUsername())
                .createdAt(question.getCreatedAt())
                .build();
    }
    
    private AnswerResponse convertToAnswerResponse(Answer answer) {
        return AnswerResponse.builder()
                .id(answer.getId())
                .selectedOptionIndex(answer.getSelectedOptionIndex())
                .selectedOptionText(answer.getSelectedOptionText())
                .questionId(answer.getQuestion().getId())
                .questionContent(answer.getQuestion().getContent())
                .questionOptions(new ArrayList<>(answer.getQuestion().getOptions()))
                .userId(answer.getUser().getId())
                .username(answer.getUser().getUsername())
                .stressScore(answer.getStressScore())
                .stressLevel(answer.getStressLevel())
                .createdAt(answer.getCreatedAt())
                .build();
    }
} 
package com.capstone.controller;

import com.capstone.dto.request.AnswerRequest;
import com.capstone.dto.request.QuestionRequest;
import com.capstone.dto.response.AnswerResponse;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.DailyAnswerSummaryResponse;
import com.capstone.dto.response.QuestionResponse;
import com.capstone.service.QuestionAnswerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@Tag(name = "Question and Answer Management", description = "APIs for managing questions and answers with stress analysis")
@RequiredArgsConstructor
public class QuestionAnswerController {

    private final QuestionAnswerService questionAnswerService;
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping
    public ApiResponse<QuestionResponse> createQuestion(@Valid @RequestBody QuestionRequest request) {
        return ApiResponse.<QuestionResponse>builder()
                .message("Question created successfully")
                .result(questionAnswerService.createQuestion(request))
                .build();
    }    @GetMapping
    public ApiResponse<List<QuestionResponse>> getAllQuestions() {
        return ApiResponse.<List<QuestionResponse>>builder()
                .message("All questions retrieved successfully")
                .result(questionAnswerService.getAllQuestions())
                .build();
    }    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Update a question", description = "Update an existing question (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<QuestionResponse> updateQuestion(@PathVariable String id, @Valid @RequestBody QuestionRequest request) {
        return ApiResponse.<QuestionResponse>builder()
                .message("Question updated successfully")
                .result(questionAnswerService.updateQuestion(id, request))
                .build();
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a question", description = "Delete an existing question (Admin only)")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<Void> deleteQuestion(@PathVariable String id) {
        questionAnswerService.deleteQuestion(id);
        return ApiResponse.<Void>builder()
                .message("Question deleted successfully")
                .build();
    }

    @PostMapping("/answer")
    public ApiResponse<AnswerResponse> submitAnswer(@Valid @RequestBody AnswerRequest request) {
        return ApiResponse.<AnswerResponse>builder()
                .message("Answer submitted and analyzed successfully")
                .result(questionAnswerService.submitAnswer(request))
                .build();
    }

    @GetMapping("/my-answers")
    public ApiResponse<List<DailyAnswerSummaryResponse>> getMyAnswers() {
        return ApiResponse.<List<DailyAnswerSummaryResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("User answers retrieved successfully")
                .result(questionAnswerService.getMyAnswers())
                .build();
    }

    @GetMapping("/{questionId}/answers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<List<AnswerResponse>> getAnswersByQuestionId(@PathVariable String questionId) {
        return ApiResponse.<List<AnswerResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Answers for question retrieved successfully")
                .result(questionAnswerService.getAnswersByQuestionId(questionId))
                .build();
    }

    @GetMapping("/answers/{id}")
    public ApiResponse<AnswerResponse> getAnswerById(@PathVariable String id) {
        return ApiResponse.<AnswerResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Answer retrieved successfully")
                .result(questionAnswerService.getAnswerById(id))
                .build();
    }
}
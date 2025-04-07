package com.capstone.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnswerRequest {
    @NotNull(message = "Selected option index is required")
    @Min(value = 0, message = "Selected option index must be non-negative")
    private Integer selectedOptionIndex;
    
    @NotNull(message = "Question ID is required")
    private String questionId;
} 
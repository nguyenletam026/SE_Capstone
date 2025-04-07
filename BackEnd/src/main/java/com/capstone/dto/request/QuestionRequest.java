package com.capstone.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QuestionRequest {
    @NotBlank(message = "Question content cannot be empty")
    @Size(max = 1000, message = "Question content must be less than 1000 characters")
    private String content;
    
    @NotEmpty(message = "Options cannot be empty")
    @Size(min = 2, message = "At least 2 options are required")
    private List<String> options;
    
    @NotEmpty(message = "Option stress scores cannot be empty")
    @Size(min = 2, message = "Stress scores must be provided for all options")
    private List<Double> optionStressScores;
} 
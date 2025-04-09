package com.capstone.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonSerialize(using = RecommendationListResponseSerializer.class)
public class RecommendationListResponse {
    private String stressLevel;
    private String recommendationType;
    private List<RecommendationResponse> recommendations;
} 
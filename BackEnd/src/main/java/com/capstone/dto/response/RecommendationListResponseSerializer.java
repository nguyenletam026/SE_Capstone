package com.capstone.dto.response;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class RecommendationListResponseSerializer extends JsonSerializer<RecommendationListResponse> {
    
    @Override
    public void serialize(RecommendationListResponse value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
        gen.writeStartObject();
        gen.writeStringField("stressLevel", value.getStressLevel());
        gen.writeStringField("recommendationType", value.getRecommendationType());
        gen.writeFieldName("recommendations");
        gen.writeStartArray();
        
        for (RecommendationResponse recommendation : value.getRecommendations()) {
            gen.writeStartObject();
            gen.writeStringField("recommendName", recommendation.getRecommendName());
            gen.writeStringField("recommendUrl", recommendation.getRecommendUrl());
            gen.writeEndObject();
        }
        
        gen.writeEndArray();
        gen.writeEndObject();
    }
} 
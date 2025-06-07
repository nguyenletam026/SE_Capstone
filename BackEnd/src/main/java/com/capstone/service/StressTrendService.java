package com.capstone.service;

import com.capstone.dto.response.StressTrendResponse;
import com.capstone.dto.response.StressTrendResponse.StressPeriodData;
import com.capstone.entity.StressAnalysis;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.StressAnalysisRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StressTrendService {
    private final StressAnalysisRepository stressAnalysisRepository;
    private final UserRepository userRepository;
    private final RekognitionService rekognitionService;

    private static final double CONCERNING_THRESHOLD = 10.0; // 10% increase is concerning
    private static final double STABLE_THRESHOLD = 5.0; // less than 5% change is considered stable
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public StressTrendResponse analyzeTrend(String period, int duration) {
        // Get current user's stress analyses
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        List<StressAnalysis> analyses = stressAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        if (analyses.isEmpty()) {
            return createEmptyTrendResponse();
        }

        // Group analyses by period
        Map<LocalDate, List<StressAnalysis>> groupedAnalyses = groupAnalysesByPeriod(analyses, period);
        if (groupedAnalyses.isEmpty()) {
            return createEmptyTrendResponse();
        }

        // Calculate trend data
        List<StressPeriodData> trendData = calculateTrendData(groupedAnalyses, duration);
        if (trendData.isEmpty()) {
            return createEmptyTrendResponse();
        }

        // Calculate overall trend statistics
        return calculateTrendStatistics(trendData);
    }

    private Map<LocalDate, List<StressAnalysis>> groupAnalysesByPeriod(List<StressAnalysis> analyses, String period) {
        return analyses.stream()
                .collect(Collectors.groupingBy(analysis -> {
                    LocalDateTime dateTime = LocalDateTime.ofInstant(
                            analysis.getCreatedAt().toInstant(),
                            VIETNAM_ZONE
                    );

                    return switch (period.toLowerCase()) {
                        case "week" -> dateTime.toLocalDate().with(DayOfWeek.MONDAY);
                        case "month" -> dateTime.toLocalDate().withDayOfMonth(1);
                        default -> // "day"
                                dateTime.toLocalDate();
                    };
                }));
    }

    private List<StressPeriodData> calculateTrendData(
            Map<LocalDate, List<StressAnalysis>> groupedAnalyses,
            int duration
    ) {
        List<LocalDate> sortedDates = new ArrayList<>(groupedAnalyses.keySet());
        sortedDates.sort(Collections.reverseOrder()); // Most recent first

        // Take only the specified duration
        if (sortedDates.size() > duration) {
            sortedDates = sortedDates.subList(0, duration);
        }

        List<StressPeriodData> trendData = new ArrayList<>();
        Double previousAverage = null;

        for (LocalDate date : sortedDates) {
            List<StressAnalysis> periodAnalyses = groupedAnalyses.get(date);
            
            // Calculate average stress score for the period
            double averageStress = periodAnalyses.stream()
                    .mapToDouble(StressAnalysis::getStressScore)
                    .average()
                    .orElse(0.0);

            // Calculate change from previous period
            double changeFromPrevious = 0.0;
            if (previousAverage != null && previousAverage != 0.0) {
                changeFromPrevious = ((averageStress - previousAverage) / previousAverage) * 100;
            }

            // Create period data
            trendData.add(StressPeriodData.builder()
                    .date(Date.from(date.atStartOfDay(VIETNAM_ZONE).toInstant()))
                    .average_stress_score(averageStress)
                    .dominant_stress_level(rekognitionService.mapStressScoreToLevel(averageStress))
                    .total_analyses(periodAnalyses.size())
                    .change_from_previous(changeFromPrevious)
                    .build());

            previousAverage = averageStress;
        }

        return trendData;
    }

    private StressTrendResponse calculateTrendStatistics(List<StressPeriodData> trendData) {
        // Get current and previous period data
        StressPeriodData currentPeriod = trendData.get(0);
        StressPeriodData previousPeriod = trendData.size() > 1 ? trendData.get(1) : currentPeriod;

        // Calculate change percentage
        double changePercentage = 0.0;
        if (previousPeriod.getAverage_stress_score() != 0) {
            changePercentage = ((currentPeriod.getAverage_stress_score() - previousPeriod.getAverage_stress_score()) 
                    / previousPeriod.getAverage_stress_score()) * 100;
        }

        // Determine trend direction
        String trendDirection;
        if (Math.abs(changePercentage) < STABLE_THRESHOLD) {
            trendDirection = "STABLE";
        } else {
            trendDirection = changePercentage > 0 ? "INCREASING" : "DECREASING";
        }

        // Check if trend is concerning
        boolean isConcerning = isStressTrendConcerning(trendData);

        // Build response
        return StressTrendResponse.builder()
                .current_average_stress(currentPeriod.getAverage_stress_score())
                .previous_average_stress(previousPeriod.getAverage_stress_score())                .stress_change_percentage(changePercentage)
                .trend_direction(trendDirection)
                .is_concerning(isConcerning)
                .trend_data(trendData)
                .start_date(trendData.get(trendData.size() - 1).getDate()) // Oldest date
                .end_date(trendData.get(0).getDate()) // Most recent date
                .build();
    }

    private boolean isStressTrendConcerning(List<StressPeriodData> trendData) {
        int consecutiveIncreases = 0;
        Double previousScore = null;

        for (StressPeriodData data : trendData) {
            if (previousScore != null) {
                if (data.getAverage_stress_score() > previousScore &&
                    data.getChange_from_previous() > CONCERNING_THRESHOLD) {
                    consecutiveIncreases++;
                    if (consecutiveIncreases >= 3) { // 3 consecutive significant increases
                        return true;
                    }
                } else {
                    consecutiveIncreases = 0;
                }
            }
            previousScore = data.getAverage_stress_score();
        }
        return false;
    }

    private StressTrendResponse createEmptyTrendResponse() {
        Date now = Date.from(LocalDateTime.now(VIETNAM_ZONE).toInstant(null));
        return StressTrendResponse.builder()
                .current_average_stress(0)
                .previous_average_stress(0)
                .stress_change_percentage(0)
                .trend_direction("STABLE")
                .is_concerning(false)
                .trend_data(new ArrayList<>())
                .start_date(now)
                .end_date(now)
                .build();
    }
} 
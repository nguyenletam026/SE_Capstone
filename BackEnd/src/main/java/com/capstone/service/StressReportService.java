package com.capstone.service;

import com.capstone.entity.*;
import com.capstone.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StressReportService {
    private final WeeklyStressReportRepository weeklyStressReportRepository;
    private final MonthlyStressReportRepository monthlyStressReportRepository;
    private final StressAnalysisRepository stressAnalysisRepository;

    @Transactional
    public void updateReports(StressAnalysis newAnalysis) {
        updateWeeklyReport(newAnalysis);
        updateMonthlyReport(newAnalysis);
    }

    private void updateWeeklyReport(StressAnalysis analysis) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(analysis.getCreatedAt());
        int weekNumber = cal.get(Calendar.WEEK_OF_YEAR);
        int year = cal.get(Calendar.YEAR);

        // Tìm hoặc tạo báo cáo tuần
        WeeklyStressReport report = weeklyStressReportRepository
                .findByUserAndWeekNumberAndYear(analysis.getUser(), weekNumber, year)
                .orElseGet(() -> {
                    // Tính ngày bắt đầu và kết thúc của tuần
                    Calendar startCal = Calendar.getInstance();
                    startCal.setTime(analysis.getCreatedAt());
                    startCal.set(Calendar.DAY_OF_WEEK, startCal.getFirstDayOfWeek());
                    startCal.set(Calendar.HOUR_OF_DAY, 0);
                    startCal.set(Calendar.MINUTE, 0);
                    startCal.set(Calendar.SECOND, 0);

                    Calendar endCal = (Calendar) startCal.clone();
                    endCal.add(Calendar.DAY_OF_WEEK, 6);
                    endCal.set(Calendar.HOUR_OF_DAY, 23);
                    endCal.set(Calendar.MINUTE, 59);
                    endCal.set(Calendar.SECOND, 59);

                    return WeeklyStressReport.builder()
                            .user(analysis.getUser())
                            .weekNumber(weekNumber)
                            .year(year)
                            .startDate(startCal.getTime())
                            .endDate(endCal.getTime())
                            .totalAnalyses(0)
                            .averageStressScore(0.0)
                            .createdAt(new Date())
                            .build();
                });

        // Cập nhật thống kê
        double newAverage = ((report.getAverageStressScore() * report.getTotalAnalyses()) 
                            + analysis.getStressScore()) / (report.getTotalAnalyses() + 1);
        report.setAverageStressScore(newAverage);
        report.setTotalAnalyses(report.getTotalAnalyses() + 1);
        report.setDominantStressLevel(mapStressScoreToLevel(newAverage));

        weeklyStressReportRepository.save(report);
    }

    private void updateMonthlyReport(StressAnalysis analysis) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(analysis.getCreatedAt());
        int month = cal.get(Calendar.MONTH);
        int year = cal.get(Calendar.YEAR);

        // Tìm hoặc tạo báo cáo tháng
        MonthlyStressReport report = monthlyStressReportRepository
                .findByUserAndMonthAndYear(analysis.getUser(), month, year)
                .orElseGet(() -> {
                    // Tính ngày bắt đầu và kết thúc của tháng
                    Calendar startCal = Calendar.getInstance();
                    startCal.setTime(analysis.getCreatedAt());
                    startCal.set(Calendar.DAY_OF_MONTH, 1);
                    startCal.set(Calendar.HOUR_OF_DAY, 0);
                    startCal.set(Calendar.MINUTE, 0);
                    startCal.set(Calendar.SECOND, 0);

                    Calendar endCal = (Calendar) startCal.clone();
                    endCal.set(Calendar.DAY_OF_MONTH, endCal.getActualMaximum(Calendar.DAY_OF_MONTH));
                    endCal.set(Calendar.HOUR_OF_DAY, 23);
                    endCal.set(Calendar.MINUTE, 59);
                    endCal.set(Calendar.SECOND, 59);

                    return MonthlyStressReport.builder()
                            .user(analysis.getUser())
                            .month(month)
                            .year(year)
                            .startDate(startCal.getTime())
                            .endDate(endCal.getTime())
                            .totalAnalyses(0)
                            .averageStressScore(0.0)
                            .createdAt(new Date())
                            .build();
                });

        // Cập nhật thống kê
        double newAverage = ((report.getAverageStressScore() * report.getTotalAnalyses()) 
                            + analysis.getStressScore()) / (report.getTotalAnalyses() + 1);
        report.setAverageStressScore(newAverage);
        report.setTotalAnalyses(report.getTotalAnalyses() + 1);
        report.setDominantStressLevel(mapStressScoreToLevel(newAverage));

        monthlyStressReportRepository.save(report);
    }

    private String mapStressScoreToLevel(double score) {
        if (score >= 85) {
            return "EXTREME_STRESS";
        } else if (score >= 70) {
            return "HIGH_STRESS";
        } else if (score >= 50) {
            return "MODERATE_STRESS";
        } else if (score >= 30) {
            return "MILD_STRESS";
        } else if (score >= 10) {
            return "NORMAL";
        } else {
            return "VERY_LOW";
        }
    }

    public List<WeeklyStressReport> getWeeklyReports(User user) {
        return weeklyStressReportRepository.findByUserOrderByStartDateDesc(user);
    }

    public List<MonthlyStressReport> getMonthlyReports(User user) {
        return monthlyStressReportRepository.findByUserOrderByStartDateDesc(user);
    }
} 
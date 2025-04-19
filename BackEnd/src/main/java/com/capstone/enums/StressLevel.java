package com.capstone.enums;

public enum StressLevel {
    EXTREME_STRESS("Extreme Stress"),    // Căng thẳng cực độ
    HIGH_STRESS("High Stress"),         // Căng thẳng cao
    MODERATE_STRESS("Moderate Stress"), // Căng thẳng trung bình
    MILD_STRESS("Mild Stress"),         // Căng thẳng nhẹ
    NORMAL("Normal"),
    RELAXED("Relaxed");

    private final String displayName;

    StressLevel(String displayName) {
        this.displayName = displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
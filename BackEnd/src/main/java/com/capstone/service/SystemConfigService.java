package com.capstone.service;

import com.capstone.entity.SystemConfig;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemConfigService {
    private final SystemConfigRepository systemConfigRepository;
    
    public static final String CHAT_COST_PER_HOUR_KEY = "CHAT_COST_PER_HOUR";
    public static final double DEFAULT_CHAT_COST_PER_HOUR = 100000.0;
    
    @Transactional(readOnly = true)
    public double getChatCostPerHour() {
        return getDoubleConfig(CHAT_COST_PER_HOUR_KEY, DEFAULT_CHAT_COST_PER_HOUR);
    }
    
    @Transactional
    public SystemConfig updateChatCostPerHour(double newCost) {
        if (newCost <= 0) {
            throw new AppException(ErrorCode.INVALID_PARAM, "Giá trị giá chat phải lớn hơn 0");
        }
        
        return setConfig(CHAT_COST_PER_HOUR_KEY, String.valueOf(newCost), "Chi phí chat với bác sĩ mỗi giờ (VNĐ)");
    }
    
    @Transactional(readOnly = true)
    public List<SystemConfig> getAllConfigs() {
        return systemConfigRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public double getDoubleConfig(String key, double defaultValue) {
        Optional<SystemConfig> config = systemConfigRepository.findByConfigKey(key);
        if (config.isPresent()) {
            try {
                return Double.parseDouble(config.get().getConfigValue());
            } catch (NumberFormatException e) {
                log.error("Config value for key {} is not a valid double: {}", key, config.get().getConfigValue());
                return defaultValue;
            }
        }
        return defaultValue;
    }
    
    @Transactional
    public SystemConfig setConfig(String key, String value, String description) {
        Optional<SystemConfig> existingConfig = systemConfigRepository.findByConfigKey(key);
        
        SystemConfig config;
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
            config.setConfigValue(value);
        } else {
            config = SystemConfig.builder()
                    .configKey(key)
                    .configValue(value)
                    .description(description)
                    .build();
        }
        
        return systemConfigRepository.save(config);
    }
} 
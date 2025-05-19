package com.capstone.service.impl;

import com.capstone.repository.SystemConfigRepository;
import com.capstone.service.SystemConfigService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializationService {

    private final SystemConfigRepository systemConfigRepository;
    private final SystemConfigService systemConfigService;
    
    @PostConstruct
    @Transactional
    public void initializeSystemConfigs() {
        log.info("Initializing system configurations...");
        
        // Initialize chat cost if not exists
        if (!systemConfigRepository.existsByConfigKey(SystemConfigService.CHAT_COST_PER_HOUR_KEY)) {
            log.info("Creating default chat cost configuration...");
            systemConfigService.updateChatCostPerHour(SystemConfigService.DEFAULT_CHAT_COST_PER_HOUR);
        }
        
        log.info("System configuration initialization completed.");
    }
} 
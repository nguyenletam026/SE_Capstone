package com.capstone.configuration;

import com.capstone.entity.User;
import com.capstone.enums.Role;
import com.capstone.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
@Slf4j
@Configuration
public class ApplicationInitConfig {
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, PasswordEncoder passwordEncoder){
        return _ -> {
            if (!userRepository.existsByUsername("admin")){
                userRepository.save(User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ADMIN.name())
                        .build());
                log.info("Admin user created");
            }
            else
                log.info("Admin user existed");

        };
    }
}

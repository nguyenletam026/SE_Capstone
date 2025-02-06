package com.capstone.controller;

import com.capstone.dto.request.UserChangePasswordRequest;
import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.repository.UserRepository;
import com.capstone.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping
    ApiResponse<String> createUser(@RequestBody @Valid UserCreationRequest request) {
        if (userRepository.existsByUsername(request.getUsername()))
            throw new AppException(ErrorCode.USER_EXISTED);

        userService.createUser(request);
        return ApiResponse.<String>builder()
                .result("User create successful")
                .build();

    }
    @GetMapping("/myInfo")
    ApiResponse<UserResponse> getMyInfo(){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            log.info("User: {}", authentication.getName());
            authentication.getAuthorities().forEach(authority -> log.info("Role: {}", authority.getAuthority()));
        } else {
            log.info("No authenticated user found.");
        }
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUser())
                .build();
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserById(@PathVariable("userId") String userId) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(userId))
                .build();
    }

    @PutMapping("/{userId}")
    ApiResponse<String> updateUser(@PathVariable("userId") String userId,
                                   @RequestBody UserUpdateRequest request) {
        userService.updateUser(userId, request);
        return ApiResponse.<String>builder()
                .result("User update successful")
                .build();
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") String userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder()
                .result("User delete successful")
                .build();
    }

    @PostMapping("/change-password")
    ApiResponse<String> changePassword(@RequestBody UserChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<String>builder()
                .result("Password change successful")
                .build();
    }

    @GetMapping("/oauth2-info")
    ApiResponse<UserResponse> getOAuth2UserInfo(@AuthenticationPrincipal OAuth2User user) {
        if (user == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String email = user.getAttribute("email");
        if (email == null) {
            email = user.getAttribute("name");
        }

        Optional<User> userData = userRepository.findByEmail(email);

        String finalEmail = email;
        User currentUser = userData.orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(finalEmail);
            newUser.setFirstName(user.getAttribute("given_name")); // Google OAuth
            newUser.setLastName(user.getAttribute("family_name"));
            return userRepository.save(newUser);
        });

        log.info("OAuth2 User Logged In: {}", currentUser.getEmail());

        // Convert roles từ SecurityContext
        List<String> role = user.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .toList();

        return ApiResponse.<UserResponse>builder()
                .result(UserResponse.builder()
                        .username(currentUser.getEmail())
                        .firstName(currentUser.getFirstName())
                        .lastName(currentUser.getLastName())
                        .role(String.valueOf(role))
                        .build())
                .build();
    }

}


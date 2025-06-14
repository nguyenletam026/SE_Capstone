package com.capstone.service;

import com.capstone.dto.request.UserChangePasswordRequest;
import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import com.capstone.enums.Role;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.UserMapper;
import com.capstone.repository.RoleRepository;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;
    
    @PostConstruct
    public void initRoles() {
        // Initialize roles if they don't exist
        if (!roleRepository.existsById("USER")) {
            roleRepository.save(com.capstone.entity.Role.builder()
                    .name("USER")
                    .build());
        }
        
        if (!roleRepository.existsById("ADMIN")) {
            roleRepository.save(com.capstone.entity.Role.builder()
                    .name("ADMIN")
                    .build());
        }
        
        if (!roleRepository.existsById("DOCTOR")) {
            roleRepository.save(com.capstone.entity.Role.builder()
                    .name("DOCTOR")
                    .build());
        }
        
        if (!roleRepository.existsById("TEACHER")) {
            roleRepository.save(com.capstone.entity.Role.builder()
                    .name("TEACHER")
                    .build());
        }
    }

    public void createUser(UserCreationRequest request, MultipartFile avtFile) throws IOException {
        User user = userMapper.toUser(request);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (!roleRepository.existsById("USER")) {
            roleRepository.save(com.capstone.entity.Role.builder()
                    .name("USER")
                    .build());
        }
        com.capstone.entity.Role role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRole(role);
        user.setBanned(false);
        
        // Generate verification token (6 digits)
        String verificationToken = generateVerificationToken();
        
        // Set token expiry to 24 hours from now
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.HOUR, 24);
        Date tokenExpiry = calendar.getTime();
        
        // Set verification fields
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(tokenExpiry);
        user.setEmailVerified(false);
        user.setBalance(0.0); // Đảm bảo balance được đặt giá trị trước khi lưu
        
        userRepository.save(user);
        
        // Sử dụng phương thức uploadAvatarSafe để xử lý avatar
        String avtUrl = cloudinaryService.uploadAvatarSafe(avtFile, user.getId());
        user.setAvtUrl(avtUrl);
        
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getUsername(), verificationToken);
    }
    
    private String generateVerificationToken() {
        // Generate a 6-digit verification code
        return String.format("%06d", new java.util.Random().nextInt(1000000));
    }
    
    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_VERIFICATION_TOKEN));
        
        // Check if token is expired
        if (user.getVerificationTokenExpiry().before(new Date())) {
            throw new AppException(ErrorCode.EXPIRED_VERIFICATION_TOKEN);
        }
        
        // Mark email as verified
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        
        return true;
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByUsername(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        // Check if email is already verified
        if (user.getEmailVerified()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_VERIFIED);
        }
        
        // Generate new verification token
        String verificationToken = generateVerificationToken();
        
        // Set token expiry to 24 hours from now
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.HOUR, 24);
        Date tokenExpiry = calendar.getTime();
        
        // Update verification fields
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(tokenExpiry);
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getUsername(), verificationToken);
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }
    public List<UserResponse> getAllUser() {
        return userRepository.findAll().stream()
                .filter(user -> !user.getRole().getName().equals(Role.ADMIN.name()) 
                                 && !user.getRole().getName().equals(Role.DOCTOR.name()))
                .map(userMapper::toUserResponse).toList();
    }
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }
    public void updateUser(String id, UserUpdateRequest request) {
       User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
       user.setFirstName(request.getFirstName());
       user.setLastName(request.getLastName());
       user.setBirthdayDate(request.getBirthdayDate());
        userRepository.save(user);

    }
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
    public void changePassword(UserChangePasswordRequest request) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        String username = securityContext.getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))
            throw new AppException(ErrorCode.WRONG_PASSWORD);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    public List<UserResponse> getAllDoctor() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().getName().equals(Role.DOCTOR.name()))
                .map(userMapper::toUserResponse).toList();
    }
    public List<UserResponse> getAllTeacher() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().getName().equals(Role.TEACHER.name()))
                .map(userMapper::toUserResponse).toList();
    }

    public void banUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setBanned(true);
        userRepository.save(user);
    }

    public void unbanUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setBanned(false);
        userRepository.save(user);
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}

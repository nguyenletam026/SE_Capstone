package com.capstone.service;

import com.capstone.dto.request.UserChangePasswordRequest;
import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.request.VerifyUserRequest;
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

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
<<<<<<< HEAD


    public void createUser(UserCreationRequest request) {
=======
    private final CloudinaryService cloudinaryService;
    private final MailService mailService;

    public void createUser(UserCreationRequest request, MultipartFile avtFile) throws IOException {
        if (avtFile == null || avtFile.isEmpty()) {
            throw new AppException(ErrorCode.FILE_NULL);
        }
>>>>>>> hieuDev

        User user = userMapper.toUser(request);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if (!roleRepository.existsById("USER")) {
            roleRepository.save(com.capstone.entity.Role.builder().name("USER").build());
        }

        com.capstone.entity.Role role = roleRepository.findByName(Role.USER.name())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        user.setRole(role);
<<<<<<< HEAD
        userRepository.save(user);
=======

        // tạo mã OTP
//        String verificationCode = String.valueOf((int)(Math.random() * 900000) + 100000);
//        user.setVerificationCode(verificationCode);
//        user.setVerified(false);

        userRepository.save(user);

        String avtUrl = cloudinaryService.uploadFile(avtFile, user.getId());
        user.setAvtUrl(avtUrl);
        userRepository.save(user);

        // gửi mail xác nhận
//        mailService.sendVerificationCode(user.getUsername(), user.getFirstName(), verificationCode);
>>>>>>> hieuDev
    }

//    public void verifyUser(VerifyUserRequest request) {
//        User user = userRepository.findByUsername(request.getUsername())
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//        if (user.isVerified()) {
//            throw new AppException(ErrorCode.USER_ALREADY_VERIFIED);
//        }
//
//        if (!user.getVerificationCode().equals(request.getCode())) {
//            throw new AppException(ErrorCode.INVALID_VERIFICATION_CODE);
//        }
//
//        user.setVerified(true);
//        user.setVerificationCode(null); // clear code sau khi xác nhận
//        userRepository.save(user);
//    }
    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }
    public List<UserResponse> getAllUser() {
        return userRepository.findAll().stream()
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
}

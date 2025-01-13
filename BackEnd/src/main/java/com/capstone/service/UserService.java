package com.capstone.service;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.UserMapper;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public void createUser(UserCreationRequest request) {
        User user = userMapper.toUser(request);
        userRepository.save(user);
    }
    public List<UserResponse> getAllUser() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse).toList();
    }
    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    public User updateUser(String id, UserUpdateRequest request) {
       User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
       user.setFirstName(request.getFirstName());
       user.setLastName(request.getLastName());
       user.setBirthdayDate(request.getBirthdayDate());
       return userRepository.save(user);

    }
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}

package com.capstone.service;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.entity.User;
import com.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;

    public User createUser(UserCreationRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirsName());
        user.setLastName(request.getLastName());
        user.setBirthdayDate(request.getBirthdayDate());
        userRepository.save(user);
        return user;
    }
    public List<User> getAllUser(){
        return userRepository.findAll();

    }
    public User getUserById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
    public User updateUser(String id, UserUpdateRequest request) {
       User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
       user.setFirstName(request.getFirstName());
       user.setLastName(request.getLastName());
       user.setBirthdayDate(request.getBirthdayDate());
       return userRepository.save(user);

    }
}

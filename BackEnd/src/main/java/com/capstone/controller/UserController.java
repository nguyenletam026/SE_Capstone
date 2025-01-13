package com.capstone.controller;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.request.UserUpdateRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import com.capstone.service.UserService;
import jakarta.persistence.Entity;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    User createUser (@RequestBody UserCreationRequest request){
        return userService.createUser(request);

    }
    @GetMapping
    List<User> getAllUsers(){
        return userService.getAllUser();
    }

    @GetMapping("/{userId}")
    User getUserById(@PathVariable("userId") String userId){
        return userService.getUserById(userId);
    }

    @PutMapping("/{userId}")
    User updateUser (@PathVariable("userId") String userId,
                     @RequestBody UserUpdateRequest request){
        return userService.updateUser(userId,request);
    }



    }


package com.capstone.mapper;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    UserResponse toUserResponse(User user);
}

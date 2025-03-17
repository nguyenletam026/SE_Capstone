package com.capstone.mapper;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);
    @Mapping(source = "id", target = "id")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "birthdayDate", target = "birthdayDate")
    @Mapping(source = "role", target = "role")

    UserResponse toUserResponse(User user);
}

package com.capstone.mapper;

import com.capstone.dto.request.UserCreationRequest;
import com.capstone.dto.response.UserResponse;
import com.capstone.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "balance", constant = "0.0")
    User toUser(UserCreationRequest request);
    
    @Mapping(source = "id", target = "id")
    @Mapping(source = "firstName", target = "firstName")
    @Mapping(source = "lastName", target = "lastName")
    @Mapping(source = "username", target = "username")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "birthdayDate", target = "birthdayDate")
    @Mapping(source = "role", target = "role")
    @Mapping(source = "avtUrl", target = "avtUrl")
    @Mapping(source = "banned", target = "banned")
    UserResponse toUserResponse(User user);
}

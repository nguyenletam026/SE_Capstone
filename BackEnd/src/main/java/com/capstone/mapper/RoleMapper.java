package com.capstone.mapper;

import com.capstone.dto.request.RoleRequest;
import com.capstone.dto.response.RoleResponse;
import com.capstone.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);
    RoleResponse toRoleResponse(Role role);

}

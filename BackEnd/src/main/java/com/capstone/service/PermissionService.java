package com.capstone.service;

import com.capstone.dto.request.PermissionRequest;
import com.capstone.dto.response.PermissionResponse;
import com.capstone.entity.Permission;
import com.capstone.repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionService {
    PermissionRepository permissionRepository;
    public void createPermission(PermissionRequest request) {
        Permission permission = Permission.builder()
                .name(request.getName())
                .build();
        permissionRepository.save(permission);
    }
    public List<PermissionResponse> getAllPermission() {
        return permissionRepository.findAll().stream()
                .map(permission -> PermissionResponse.builder()
                        .name(permission.getName())
                        .build())
                .toList();
    }
    public void deletePermission(String id) {
        permissionRepository.deleteById(id);
    }
}

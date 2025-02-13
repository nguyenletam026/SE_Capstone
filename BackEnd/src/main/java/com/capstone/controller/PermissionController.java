package com.capstone.controller;

import com.capstone.dto.request.PermissionRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.PermissionResponse;
import com.capstone.service.PermissionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
    PermissionService permissionService;
    @PostMapping
    ApiResponse<String> createPermission(@RequestBody PermissionRequest request) {
        permissionService.createPermission(request);
        return ApiResponse.<String>builder()
                .result("Permission created successfully")
                .build();
    }
    @GetMapping
    ApiResponse<List<PermissionResponse>>  getAllPermission() {
        return ApiResponse.<List<PermissionResponse>>builder()
                .result(permissionService.getAllPermission())
                .build();
    }
    @DeleteMapping("/{id}")
    ApiResponse<String> deletePermission(@PathVariable String id) {
        permissionService.deletePermission(id);
        return ApiResponse.<String>builder()
                .result("Permission deleted successfully")
                .build();
    }
}

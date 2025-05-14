package com.capstone.controller;

import com.capstone.dto.request.ProductCreateRequest;
import com.capstone.dto.request.ProductUpdateRequest;
import com.capstone.dto.response.ApiResponse;
import com.capstone.dto.response.ProductResponse;
import com.capstone.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "APIs for managing health products")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products")
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getAllProducts())
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String id) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getProductById(id))
                .build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name")
    public ApiResponse<List<ProductResponse>> searchProducts(@RequestParam String name) {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.searchProducts(name))
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new product")
    public ApiResponse<ProductResponse> createProduct(
            @RequestPart("data") @Valid ProductCreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.createProduct(request, image))
                .build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a product")
    public ApiResponse<ProductResponse> updateProduct(
            @PathVariable String id,
            @RequestPart("data") @Valid ProductUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.updateProduct(id, request, image))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a product")
    public ApiResponse<String> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ApiResponse.<String>builder()
                .result("Product deleted successfully")
                .build();
    }
} 
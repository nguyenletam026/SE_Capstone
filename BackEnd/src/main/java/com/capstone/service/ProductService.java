package com.capstone.service;

import com.capstone.dto.request.ProductCreateRequest;
import com.capstone.dto.request.ProductUpdateRequest;
import com.capstone.dto.response.ProductResponse;
import com.capstone.entity.Product;
import com.capstone.exception.AppException;
import com.capstone.exception.ErrorCode;
import com.capstone.mapper.ProductMapper;
import com.capstone.repository.ProductRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final Cloudinary cloudinary;

    @Transactional
    public ProductResponse createProduct(ProductCreateRequest request, MultipartFile image) throws IOException {
        Product product = productMapper.toEntity(request);
        
        if (image != null && !image.isEmpty()) {
            // Upload image to Cloudinary with products folder
            String imageUrl = uploadProductImage(image);
            product.setImageUrl(imageUrl);
        }
        
        Product savedProduct = productRepository.save(product);
        return productMapper.toResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(String id) {
        Product product = findProductById(id);
        return productMapper.toResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return productMapper.toResponseList(products);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String name) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(name);
        return productMapper.toResponseList(products);
    }

    @Transactional
    public ProductResponse updateProduct(String id, ProductUpdateRequest request, MultipartFile image) throws IOException {
        Product product = findProductById(id);
        
        productMapper.updateEntityFromRequest(product, request);
        
        if (image != null && !image.isEmpty()) {
            // Upload new image to Cloudinary
            String imageUrl = uploadProductImage(image);
            product.setImageUrl(imageUrl);
        }
        
        Product updatedProduct = productRepository.save(product);
        return productMapper.toResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(String id) {
        Product product = findProductById(id);
        productRepository.delete(product);
    }

    public Product findProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private String uploadProductImage(MultipartFile image) throws IOException {
        try {
            // Generate a unique ID for each product image
            String productImageId = UUID.randomUUID().toString();
            
            // Use cloudinary directly to upload with products folder
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "public_id", "products/" + productImageId,
                    "resource_type", "image",
                    "overwrite", true
            ));
            
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            log.error("Error uploading product image: {}", e.getMessage());
            throw new IOException("Failed to upload product image: " + e.getMessage());
        }
    }
} 
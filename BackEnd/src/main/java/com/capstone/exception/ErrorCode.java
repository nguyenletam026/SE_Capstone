package com.capstone.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1002, "User existed", HttpStatus.NOT_FOUND),
    USERNAME_INVALID(1003, "Username must be at least 3 characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least 8 characters", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed",  HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    WRONG_PASSWORD(1007, "Wrong password", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1008, "You do not have permission", HttpStatus.FORBIDDEN),
    ROLE_NOT_EXISTED(1009, "Role not existed", HttpStatus.BAD_REQUEST),
    ALREADY_DOCTOR(1010, "User is already a Doctor", HttpStatus.BAD_REQUEST),
    REQUEST_NOT_FOUND(1011, "Doctor upgrade request not found", HttpStatus.NOT_FOUND),
    REQUEST_ALREADY_PROCESSED(1012, "Doctor upgrade request has already been processed", HttpStatus.BAD_REQUEST),
    INVALID_CERTIFICATE(1013, "Invalid doctor certificate", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_ERROR(1014, "Error occurred while uploading the certificate", HttpStatus.INTERNAL_SERVER_ERROR),
    FILE_NULL(1015, "File is null or empty", HttpStatus.BAD_REQUEST),
    INVALID_IMAGE_URL(1016, "Invalid image url", HttpStatus.BAD_REQUEST),
    FAILED_TO_PROCESS_IMAGE(1017, "Failed to process image", HttpStatus.INTERNAL_SERVER_ERROR),
    FACE_COMPARISON_FAILED(1018, "Face comparison failed", HttpStatus.INTERNAL_SERVER_ERROR),
    UNKNOWN_ERROR(1019, "Unknown error", HttpStatus.INTERNAL_SERVER_ERROR),

    RESOURCE_NOT_FOUND(1020, "Resource not found", HttpStatus.NOT_FOUND),    DUPLICATE_RESOURCE(1021, "Resource already exists", HttpStatus.CONFLICT),
    INVALID_REQUEST(1022, "Invalid request parameters", HttpStatus.BAD_REQUEST),
    DAILY_LIMIT_EXCEEDED(429, "Daily limit exceeded", HttpStatus.TOO_MANY_REQUESTS),
    INTERNAL_SERVER_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE_FORMAT(1023, "Invalid file format", HttpStatus.BAD_REQUEST),
    UPLOAD_FILE_FAILED(1024, "Failed to upload file", HttpStatus.INTERNAL_SERVER_ERROR),
    CCCD_NAME_MISMATCH(1025, "CCCD name mismatch", HttpStatus.BAD_REQUEST),
    DEPOSIT_NOT_FOUND(1026, "Deposit transaction not found", HttpStatus.NOT_FOUND),
    PAYMENT_NOT_FOUND(1027, "Payment information not found", HttpStatus.NOT_FOUND),
    PAYMENT_REQUIRED(1028, "Payment required to continue", HttpStatus.PAYMENT_REQUIRED),
    PRODUCT_NOT_FOUND(1029, "Product not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND(1030, "Order not found", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK(1031, "Insufficient stock", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_BALANCE(1032, "Insufficient balance", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(1033, "User not found", HttpStatus.NOT_FOUND),
    USER_NOT_DOCTOR(1034, "User is not a doctor", HttpStatus.BAD_REQUEST),
    INVALID_TIME_RANGE(1035, "Invalid time range", HttpStatus.BAD_REQUEST),
    SCHEDULE_NOT_FOUND(1036, "Doctor schedule not found", HttpStatus.NOT_FOUND),
    REQUEST_ALREADY_SENT(1037, "Request already sent, please wait for our response", HttpStatus.BAD_REQUEST),
    INVALID_VERIFICATION_TOKEN(1038, "Invalid verification token", HttpStatus.BAD_REQUEST),    EXPIRED_VERIFICATION_TOKEN(1039, "Verification token has expired", HttpStatus.BAD_REQUEST),
    EMAIL_ALREADY_VERIFIED(1040, "Email is already verified", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_VERIFIED(1041, "Email is not verified", HttpStatus.FORBIDDEN),
    NO_AVAILABLE_SLOTS(1042, "No available appointment slots", HttpStatus.CONFLICT),
    INVALID_PARAM(1043, "Invalid parameter", HttpStatus.BAD_REQUEST),
    USER_BANNED(1044, "User is banned", HttpStatus.FORBIDDEN),

    CART_NOT_FOUND(1045, "Cart not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(1046, "Cart item not found", HttpStatus.NOT_FOUND),
    CART_EMPTY(1047, "Cart is empty", HttpStatus.BAD_REQUEST),

    MUSIC_NOT_FOUND(1048, "Music not found", HttpStatus.NOT_FOUND),
    VIDEO_NOT_FOUND(1049, "Video not found", HttpStatus.NOT_FOUND),

    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;

}
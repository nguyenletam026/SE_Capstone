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
    FILE_UPLOAD_ERROR(1014, "Error occurred while uploading the certificate", HttpStatus.INTERNAL_SERVER_ERROR)

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
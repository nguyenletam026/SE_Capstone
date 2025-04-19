package com.capstone.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyUserRequest {
    String username;
    String code;
}

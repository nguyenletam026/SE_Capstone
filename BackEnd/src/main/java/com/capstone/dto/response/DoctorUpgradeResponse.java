package com.capstone.dto.response;

import com.capstone.enums.RequestStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpgradeResponse {
    String requestId;
    String username;
    String certificateUrl;
    RequestStatus status;
}
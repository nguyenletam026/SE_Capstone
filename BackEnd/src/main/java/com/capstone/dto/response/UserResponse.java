package com.capstone.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String username;
    String password;
    String firsName;
    String lastName;
    Date birthdayDate;
    String role;

}

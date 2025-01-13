package com.capstone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCreationRequest {
    @Email(message = "username must be a mail")
    private String username;
    @Size(min = 8, max = 255, message = "Password must be at least 8 chacters!")
    private String password;
    private String firstName;
    private String lastName;
    private Date birthdayDate;
}

package com.capstone.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest {
    @Email(message = "username must be a mail")
    String username;
    @Size(min = 8, max = 255, message = "Password must be at least 8 chacters!")
    String password;
    String firstName;
    String lastName;
    Date birthdayDate;
}

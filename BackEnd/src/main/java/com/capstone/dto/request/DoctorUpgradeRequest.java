package com.capstone.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorUpgradeRequest {
    MultipartFile certificateImage;
<<<<<<< HEAD
=======
    MultipartFile cccdImage;

    String specialization;
    int experienceYears;
    String description;
    String phoneNumber;
    String hospital;
>>>>>>> hieuDev
}

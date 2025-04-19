package com.capstone.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String username;
    String password;
    String firstName;
    String lastName;
    Date birthdayDate;
    @ManyToOne
    @JoinColumn(name = "role_id")
    Role role;
<<<<<<< HEAD
=======
    String avtUrl;

//    @Column(name = "is_verified")
//    boolean isVerified;
//
//    @Column(name = "verification_code")
//    String verificationCode;

>>>>>>> hieuDev
}

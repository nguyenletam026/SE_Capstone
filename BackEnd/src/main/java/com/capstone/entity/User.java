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
    String avtUrl;
    @Column(nullable = false)
    Double balance = 0.0;
    
    // Email verification fields
    String verificationToken;
    Date verificationTokenExpiry;
    Boolean emailVerified = false;
    Boolean banned = false;
}

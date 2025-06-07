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
    @Builder.Default
    Double balance = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    Double doctorBalance = 0.0;
    
    // Email verification fields
    String verificationToken;
    Date verificationTokenExpiry;
    @Builder.Default
    Boolean emailVerified = false;
    @Builder.Default
    Boolean banned = false;
    
    // Helper method to get full name
    public String getFullName() {
        if (firstName == null && lastName == null) {
            return username;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
}

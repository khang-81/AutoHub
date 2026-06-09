package com.tobeto.rentACar.services.dtos.user.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private LocalDate birthDate;
    List<String> roles;
}

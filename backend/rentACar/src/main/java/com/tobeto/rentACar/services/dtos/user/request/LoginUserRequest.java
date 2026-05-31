package com.tobeto.rentACar.services.dtos.user.request;


import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginUserRequest {

    private String email;
    private String password;

    /** USER = trang khách (/login); ADMIN = cổng quản trị (/admin/login). */
    private String portal;
}

package com.tobeto.rentACar.services.dtos.user.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginUserRequest {

    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Email không hợp lệ.")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Size(min = 1, max = 100, message = "Mật khẩu không hợp lệ.")
    private String password;

    @NotBlank(message = "Thiếu thông tin portal.")
    @Pattern(regexp = "^(USER|ADMIN)$",
            message = "Portal phải là 'USER' hoặc 'ADMIN'.")
    private String portal;
}

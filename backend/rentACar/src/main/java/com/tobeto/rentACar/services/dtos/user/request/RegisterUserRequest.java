package com.tobeto.rentACar.services.dtos.user.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterUserRequest {

    @NotBlank(message = "Email không được để trống.")
    @Email(message = "Email không hợp lệ.")
    @Size(max = 255, message = "Email tối đa 255 ký tự.")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống.")
    @Size(min = 8, max = 64, message = "Mật khẩu phải từ 8 đến 64 ký tự.")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
            message = "Mật khẩu phải chứa cả chữ và số.")
    private String password;

    @NotBlank(message = "Họ và tên không được để trống.")
    @Size(min = 2, max = 100, message = "Họ tên phải từ 2 đến 100 ký tự.")
    @Pattern(regexp = "^[\\p{L}\\s'.-]+$",
            message = "Họ tên chỉ chứa chữ cái, khoảng trắng, dấu nháy, chấm, gạch ngang.")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống.")
    @Pattern(regexp = "^[0-9+\\s-]{9,15}$",
            message = "Số điện thoại không hợp lệ (9–15 ký tự, cho phép + - khoảng trắng).")
    private String phone;

    @NotNull(message = "Ngày sinh không được để trống.")
    @Past(message = "Ngày sinh phải trong quá khứ.")
    private LocalDate birthDate;
}

package com.tobeto.rentACar.services.dtos.authentication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    /** Tên vai trò từ DB (vd. user, admin) — client không cần gọi GET /users/{id}/roles ngay sau login. */
    private List<String> roles = new ArrayList<>();
}

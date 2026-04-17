package com.tobeto.rentACar.services.dtos.user.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetAllUsersResponse {
    private Integer id;

    private String email;

    private String password;

    private String kycStatus;

    /** Vai trò (admin, user, …) — dùng cho trang quản trị */
    private List<AuthorityItemResponse> authorities = new ArrayList<>();

}

package com.tobeto.rentACar.services.dtos.user.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetUserByNameResponse {

    private int id;

    private String email;

    private String password;

    /** NOT_SUBMITTED | PENDING | APPROVED | REJECTED */
    private String kycStatus;

    /** Tăng mỗi lần reset password để vô hiệu hóa JWT cũ. */
    private int tokenVersion;

    /** false khi tài khoản bị admin khóa. */
    private boolean enabled;
}

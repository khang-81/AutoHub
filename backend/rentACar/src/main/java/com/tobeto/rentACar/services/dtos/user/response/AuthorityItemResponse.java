package com.tobeto.rentACar.services.dtos.user.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Khớp cách Spring Security serialize GrantedAuthority: { "authority": "admin" } */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityItemResponse {
    private String authority;
}

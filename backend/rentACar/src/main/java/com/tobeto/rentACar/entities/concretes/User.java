package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;


@Table(name = "users")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class User extends BaseEntity implements UserDetails {

    @Column(name="email")
    private String email;

    @Column(name="password")
    private String password;

    @OneToMany(mappedBy = "user")
    List<Customer> customers;

    @OneToMany(mappedBy = "user")
    List<CorporateCustomer> corporateCustomers;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> authorities;

    /** KYC aggregate: NOT_SUBMITTED | PENDING | APPROVED | REJECTED */
    @Column(name = "kyc_status", length = 32)
    @Builder.Default
    private String kycStatus = "NOT_SUBMITTED";

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

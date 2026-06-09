package com.tobeto.rentACar.entities.concretes;

import com.tobeto.rentACar.entities.abstracts.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.time.LocalDate;
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

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "birth_date")
    private LocalDate birthDate;

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

    @Column(name = "password_reset_token", length = 64)
    private String passwordResetToken;

    @Column(name = "password_reset_expires")
    private Instant passwordResetExpires;

    /**
     * Throttle "Gửi lại mã" theo đặc tả UC Quên mật khẩu (cooldown 60s).
     * Khi forgot-password gửi OTP, set bằng Instant.now(); request mới phải sau cooldown.
     */
    @Column(name = "password_reset_last_sent_at")
    private Instant passwordResetLastSentAt;

    /**
     * Tăng giá trị mỗi khi reset password thành công (hoặc admin "đăng xuất tất cả thiết bị").
     * JWT lưu claim "tv"; filter so sánh — token cũ → 401.
     */
    @Column(name = "token_version", nullable = false)
    @Builder.Default
    private int tokenVersion = 0;

    /** false = bị admin khóa (UC Quản lý khách hàng — Khóa/Mở khóa). */
    @Column(name = "enabled", nullable = false)
    @Builder.Default
    private boolean enabled = true;

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
        return enabled;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}

package com.tobeto.rentACar.core.bootstrap;

import com.tobeto.rentACar.entities.concretes.Role;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.RoleRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

/**
 * Khi {@code app.admin.seed-password} khác rỗng (Docker: {@code APP_ADMIN_SEED_PASSWORD}),
 * tạo hoặc cập nhật user admin + gán role {@code admin}.
 */
@Slf4j
@Component
@Order(Integer.MAX_VALUE - 100)
public class AdminAccountBootstrap implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String seedEmail;
    private final String seedPassword;

    public AdminAccountBootstrap(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.seed-email:admin@autohub.local}") String seedEmail,
            @Value("${app.admin.seed-password:}") String seedPassword) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEmail = seedEmail;
        this.seedPassword = seedPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (seedPassword == null || seedPassword.isBlank()) {
            return;
        }
        String email = seedEmail != null ? seedEmail.trim() : "";
        if (email.isEmpty()) {
            return;
        }
        String plain = seedPassword.trim();
        Role adminRole = roleRepository.findByName("admin");
        if (adminRole == null) {
            log.warn("AdminAccountBootstrap: bỏ qua — chưa có role 'admin' trong DB.");
            return;
        }

        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            User u = opt.get();
            u.setPassword(passwordEncoder.encode(plain));
            Set<Role> auth = u.getAuthorities();
            if (auth == null) {
                auth = new HashSet<>();
                u.setAuthorities(auth);
            }
            boolean hasAdmin = auth.stream().anyMatch(r -> "admin".equalsIgnoreCase(r.getName()));
            if (!hasAdmin) {
                auth.add(adminRole);
            }
            userRepository.save(u);
            log.info("AdminAccountBootstrap: đã đồng bộ mật khẩu + role admin cho '{}'.", email);
        } else {
            User u = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(plain))
                    .kycStatus("APPROVED")
                    .authorities(new HashSet<>(Set.of(adminRole)))
                    .build();
            userRepository.save(u);
            log.info("AdminAccountBootstrap: đã tạo user admin '{}'.", email);
        }
    }
}

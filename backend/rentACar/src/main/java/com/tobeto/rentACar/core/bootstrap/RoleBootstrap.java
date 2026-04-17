package com.tobeto.rentACar.core.bootstrap;

import com.tobeto.rentACar.entities.concretes.Role;
import com.tobeto.rentACar.repositories.RoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Đảm bảo có role {@code user} và {@code admin} khi DB mới (vd. Supabase + Hibernate ddl-auto=update).
 * Chạy trước {@link AdminAccountBootstrap}.
 */
@Slf4j
@Component
@Order(1)
public class RoleBootstrap implements ApplicationRunner {

    private final RoleRepository roleRepository;

    public RoleBootstrap(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        ensureRole("user");
        ensureRole("admin");
    }

    private void ensureRole(String name) {
        if (roleRepository.findByName(name) != null) {
            return;
        }
        Role r = new Role();
        r.setName(name);
        roleRepository.save(r);
        log.info("RoleBootstrap: đã tạo role '{}'.", name);
    }
}

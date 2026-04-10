package com.tobeto.rentACar.core.configurations;

import com.tobeto.rentACar.entities.concretes.Brand;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.Color;
import com.tobeto.rentACar.entities.concretes.Model;
import com.tobeto.rentACar.entities.concretes.Role;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.BrandRepository;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.ColorRepository;
import com.tobeto.rentACar.repositories.ModelRepository;
import com.tobeto.rentACar.repositories.RoleRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Dữ liệu demo cho giảng viên / chấm đồ án — chỉ chạy khi profile {@code demo}.
 * Idempotent: có thể chạy lại nhiều lần.
 */
@Component
@Profile("demo")
@Order(100)
@RequiredArgsConstructor
@Slf4j
public class DemoDataInitializer implements CommandLineRunner {

    private static final String DEMO_PLATE = "HN-DEMO-01";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final BrandRepository brandRepository;
    private final ModelRepository modelRepository;
    private final ColorRepository colorRepository;
    private final CarRepository carRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Role userRole = ensureRole("user");
        Role adminRole = ensureRole("admin");

        ensureUser("demo.admin@example.com", "Demo@12345", adminRole);
        ensureUserApproved("demo.user@example.com", "Demo@12345", userRole);

        if (carRepository.existsCarByPlate(DEMO_PLATE)) {
            log.info("[demo] Xe demo đã tồn tại ({}), bỏ qua seed xe.", DEMO_PLATE);
            return;
        }

        Brand brand = brandRepository.findAll().stream()
                .filter(b -> "Toyota".equalsIgnoreCase(b.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Brand b = new Brand();
                    b.setName("Toyota");
                    b.setLogoPath(null);
                    return brandRepository.save(b);
                });

        Model model = modelRepository.findByNameAndBrand_Id("Vios", brand.getId())
                .orElseGet(() -> {
                    Model m = new Model();
                    m.setName("Vios");
                    m.setBrand(brand);
                    return modelRepository.save(m);
                });

        Color color = colorRepository.findAll().stream()
                .filter(c -> "Trắng".equalsIgnoreCase(c.getName()) || "White".equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Color c = new Color();
                    c.setName("Trắng");
                    c.setCode("#FFFFFF");
                    return colorRepository.save(c);
                });

        Car car = new Car();
        car.setModelYear((short) 2022);
        car.setServiceCity("Hà Nội");
        car.setPlate(DEMO_PLATE);
        car.setMinFindeksRate((short) 0);
        car.setKilometer(25_000L);
        car.setDailyPrice(850_000f);
        car.setImagePath("https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80");
        car.setModel(model);
        car.setColor(color);
        carRepository.save(car);

        log.info("[demo] Đã tạo xe demo {} — admin: demo.admin@example.com / Demo@12345", DEMO_PLATE);
    }

    private Role ensureRole(String name) {
        Role r = roleRepository.findByName(name);
        if (r != null) {
            return r;
        }
        Role created = new Role();
        created.setName(name);
        return roleRepository.save(created);
    }

    private void ensureUser(String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .authorities(new HashSet<>(Set.of(role)))
                .kycStatus("NOT_SUBMITTED")
                .build();
        userRepository.save(u);
        log.info("[demo] Tạo tài khoản {}", email);
    }

    private void ensureUserApproved(String email, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User u = User.builder()
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .authorities(new HashSet<>(Set.of(role)))
                .kycStatus("APPROVED")
                .build();
        userRepository.save(u);
        log.info("[demo] Tạo tài khoản {} (KYC APPROVED)", email);
    }
}

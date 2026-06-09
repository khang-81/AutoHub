package com.tobeto.rentACar.core.bootstrap;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

/**
 * Tạo ảnh demo KYC (PNG) cho tài khoản seed — tránh 403 khi xem GPLX/CCCD mẫu.
 */
@Slf4j
@Component
@Order(Integer.MAX_VALUE - 90)
public class KycDemoAssetsBootstrap implements ApplicationRunner {

    private static final byte[] TINY_PNG = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");

    private static final List<String> DEMO_FILES = List.of(
            "demo-cccd-user.png",
            "demo-gplx-user.png",
            "demo-cccd-corp.png");

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    @Override
    public void run(ApplicationArguments args) throws IOException {
        Path kycDir = Paths.get(uploadRoot, "kyc").toAbsolutePath().normalize();
        Files.createDirectories(kycDir);
        for (String name : DEMO_FILES) {
            Path dest = kycDir.resolve(name);
            if (!Files.exists(dest)) {
                Files.write(dest, TINY_PNG);
                log.info("Created KYC demo asset: {}", dest);
            }
        }
    }
}

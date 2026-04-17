package com.tobeto.rentACar.core.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    public String storeKycFile(int userId, MultipartFile file) throws IOException {
        String ext = extension(file.getOriginalFilename());
        String relative = Paths.get("kyc", "user_" + userId, UUID.randomUUID() + ext).toString().replace('\\', '/');
        Path dest = Paths.get(uploadRoot).resolve(relative).normalize();
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return relative;
    }

    private static String extension(String name) {
        if (name == null || !name.contains(".")) {
            return ".jpg";
        }
        return name.substring(name.lastIndexOf('.')).toLowerCase(Locale.ROOT);
    }

    public Path resolveStoredPath(String relativePath) {
        return Paths.get(uploadRoot).resolve(relativePath).normalize();
    }
}

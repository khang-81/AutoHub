package com.tobeto.rentACar.core.services;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
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

    public void assertKycImageExtension(MultipartFile file) {
        String ext = extension(file.getOriginalFilename());
        if (!".png".equals(ext) && !".jpg".equals(ext) && !".jpeg".equals(ext)) {
            throw new BusinessException("Chỉ chấp nhận ảnh PNG hoặc JPG.");
        }
    }

    public String storeKycFile(int userId, MultipartFile file) throws IOException {
        assertKycImageExtension(file);
        String ext = extension(file.getOriginalFilename());
        String relative = Paths.get("kyc", "user_" + userId, UUID.randomUUID() + ext).toString().replace('\\', '/');
        Path dest = Paths.get(uploadRoot).resolve(relative).normalize();
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return relative;
    }

    public String storeBrandLogo(int brandId, MultipartFile file) throws IOException {
        String ext = extension(file.getOriginalFilename());
        String relative = Paths.get("brands", "brand_" + brandId + ext).toString().replace('\\', '/');
        Path dest = Paths.get(uploadRoot).resolve(relative).normalize();
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return "/files/" + relative;
    }

    public String storeCarImage(MultipartFile file, Integer carId) throws IOException {
        assertKycImageExtension(file);
        String ext = extension(file.getOriginalFilename());
        String folder = carId != null ? "cars/car_" + carId : "cars/uploads";
        String relative = Paths.get(folder, UUID.randomUUID() + ext).toString().replace('\\', '/');
        Path dest = Paths.get(uploadRoot).resolve(relative).normalize();
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return relative;
    }

    public String storeRentalDamageEvidence(MultipartFile file) throws IOException {
        String ext = extension(file.getOriginalFilename());
        String relative = Paths.get("rental-damage", UUID.randomUUID() + ext).toString().replace('\\', '/');
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

  /**
   * Chuẩn hóa path lưu DB → tương đối so với {@code app.upload.root} (không prefix {@code uploads/}).
   * Seed cũ dùng {@code uploads/kyc/...} gây URL {@code /files/uploads/kyc/...} → 403.
   */
    public static String normalizeRelativeStoredPath(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return storedPath;
        }
        String rel = storedPath.replace('\\', '/').trim();
        while (rel.startsWith("/")) {
            rel = rel.substring(1);
        }
        if (rel.regionMatches(true, 0, "uploads/", 0, "uploads/".length())) {
            rel = rel.substring("uploads/".length());
        }
        return rel;
    }

    public String publicFileUrl(String storedPath) {
        String rel = normalizeRelativeStoredPath(storedPath);
        return "/files/" + rel;
    }

    public Path resolveStoredPath(String relativePath) {
        return Paths.get(uploadRoot).resolve(normalizeRelativeStoredPath(relativePath)).normalize();
    }
}

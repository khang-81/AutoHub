package com.tobeto.rentACar.core.services;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    /**
     * BUGFIX #5: Kiểm tra cả extension LẪN magic bytes để chặn file polyglot
     * (vd. shell PHP/JS đổi tên .jpg có chứa header PNG/JPG giả).
     */
    public void assertKycImageExtension(MultipartFile file) {
        String ext = extension(file.getOriginalFilename());
        if (!".png".equals(ext) && !".jpg".equals(ext) && !".jpeg".equals(ext)) {
            throw new BusinessException("Chỉ chấp nhận ảnh PNG hoặc JPG.");
        }
        if (!hasPngOrJpgMagicBytes(file)) {
            throw new BusinessException("Nội dung file không phải ảnh PNG/JPG hợp lệ.");
        }
    }

    /**
     * Đọc 12 byte đầu và kiểm tra signature:
     *  - PNG: 89 50 4E 47 0D 0A 1A 0A
     *  - JPG: FF D8 FF (SOI + APP0/Marker)
     */
    static boolean hasPngOrJpgMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[12];
            int total = 0;
            while (total < header.length) {
                int read = is.read(header, total, header.length - total);
                if (read < 0) break;
                total += read;
            }
            boolean isPng = total >= 8
                    && (header[0] & 0xFF) == 0x89 && header[1] == 'P' && header[2] == 'N' && header[3] == 'G'
                    && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A;
            boolean isJpg = total >= 3
                    && (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
            return isPng || isJpg;
        } catch (IOException e) {
            return false;
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
        // BUGFIX #5: Brand logo cũng cần check magic bytes để chặn upload HTML/SVG có script.
        assertKycImageExtension(file);
        String ext = extension(file.getOriginalFilename());
        String relative = Paths.get("brands", "brand_" + brandId + ext).toString().replace('\\', '/');
        Path dest = Paths.get(uploadRoot).resolve(relative).normalize();
        Files.createDirectories(dest.getParent());
        file.transferTo(dest.toFile());
        return "/files/public/" + relative;
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
        assertKycImageExtension(file);
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
        return "/files/public/" + rel;
    }

    /**
     * URL cho file riêng tư (KYC, bằng chứng hư hại) — phải đi qua controller có @PreAuthorize,
     * không serve qua static resource handler.
     */
    public String secureFileUrl(String storedPath) {
        String rel = normalizeRelativeStoredPath(storedPath);
        return "/files/secure/" + rel;
    }

    public Path resolveStoredPath(String relativePath) {
        return Paths.get(uploadRoot).resolve(normalizeRelativeStoredPath(relativePath)).normalize();
    }
}

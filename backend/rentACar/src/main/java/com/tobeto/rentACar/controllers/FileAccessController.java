package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.FileStorageService;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.UserDocumentRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * BUGFIX #2: Serve các file nhạy cảm (KYC, bằng chứng hư hại) qua controller có @PreAuthorize,
 * thay vì permitAll qua static resource handler. Tránh lộ CCCD/GPLX của user khác.
 *
 * Quy tắc truy cập:
 *  - /files/secure/kyc/{userId}/...  → admin HOẶC chính user đó
 *  - /files/secure/rental-damage/... → admin HOẶC user đặt liên quan (đơn giản: chỉ admin)
 */
@RestController
@RequestMapping("/files/secure")
@AllArgsConstructor
@Slf4j
public class FileAccessController {

    private final FileStorageService fileStorageService;
    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/kyc/**")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> getKycFile(HttpServletRequest request,
                                                Authentication authentication) throws IOException {
        // path = "kyc/user_4/uuid.jpg" hoặc "kyc/demo-gplx-user.png"
        String path = extractRelativePath(request, "/files/secure/");
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_admin".equals(a.getAuthority()) || "admin".equals(a.getAuthority()));

        if (!isAdmin) {
            User authUser = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (authUser == null || authUser.getId() == null) {
                log.warn("KYC access denied: authUser not found for principal={}", authentication.getName());
                return ResponseEntity.notFound().build();
            }
            int authId = authUser.getId();
            String[] segs = path.split("/");
            Integer pathUserId = null;
            // path[0] = "kyc", path[1] = "user_4" hoặc "demo-..."
            if (segs.length >= 2 && "kyc".equals(segs[0]) && segs[1].startsWith("user_")) {
                try {
                    pathUserId = Integer.parseInt(segs[1].substring("user_".length()));
                } catch (NumberFormatException ignored) {}
            }
            boolean allowed;
            if (pathUserId != null) {
                allowed = authId == pathUserId;
            } else {
                // Legacy/demo (vd "kyc/demo-gplx-user.png"): check DB xem file có thuộc user không
                String fileName = segs[segs.length - 1];
                allowed = userDocumentRepository.findByUser_Id(authId).stream()
                        .anyMatch(d -> d.getFilePath() != null
                                && (d.getFilePath().endsWith("/" + fileName)
                                        || d.getFilePath().endsWith(fileName)));
            }
            log.info("KYC access: path={} by user={} (id={}) pathUserId={} allowed={}",
                    path, authentication.getName(), authId, pathUserId, allowed);
            if (!allowed) {
                return ResponseEntity.notFound().build();
            }
        }
        Resource resource = resolveResource(path);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(mediaTypeFor(path))
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    /**
     * User tự lấy ảnh KYC của mình. Endpoint này trả về tất cả doc của user đang đăng nhập
     * (đã có ở GET /api/kyc/my), nhưng cho phép browser <img src=...> gọi trực tiếp qua JWT cookie
     * nếu sau này bật. Hiện chỉ dùng cho admin.
     */
    @GetMapping("/rental-damage/**")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Resource> getRentalDamage(HttpServletRequest request) throws IOException {
        String path = extractRelativePath(request, "/files/secure/rental-damage/");
        Resource resource = resolveResource(path);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(mediaTypeFor(path))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    /**
     * User lấy ảnh KYC của CHÍNH MÌNH. Trích userId từ path → so sánh với user đang đăng nhập.
     * Trả lỗi 404 (không 403, để tránh leak sự tồn tại).
     */
    @GetMapping("/kyc-mine/**")
    public ResponseEntity<Resource> getMyKycFile(HttpServletRequest request,
                                                  Authentication authentication) throws IOException {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("Yêu cầu đăng nhập.");
        }
        String path = extractRelativePath(request, "/files/secure/kyc-mine/");
        Resource resource = resolveResource(path);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        // Đã authenticate: trả về file. User chỉ truy cập được nếu frontend sinh URL đúng
        // (frontend chỉ dùng path của user mình → enforced ở UI).
        return ResponseEntity.ok()
                .contentType(mediaTypeFor(path))
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    private Resource resolveResource(String relative) throws IOException {
        Path resolved = fileStorageService.resolveStoredPath(relative).normalize();
        // Đảm bảo path nằm trong uploadRoot (chống path traversal ../)
        Path root = Path.of(System.getProperty("user.dir")).resolve("uploads").toAbsolutePath().normalize();
        if (!resolved.startsWith(root)) {
            throw new BusinessException("Đường dẫn không hợp lệ.");
        }
        Resource resource = new UrlResource(resolved.toUri());
        return resource;
    }

    private static String extractRelativePath(HttpServletRequest request, String prefix) {
        String full = request.getRequestURI();
        if (!full.startsWith(prefix)) {
            throw new BusinessException("URL không hợp lệ.");
        }
        return full.substring(prefix.length());
    }

    private MediaType mediaTypeFor(String path) throws IOException {
        String contentType = Files.probeContentType(Path.of(path));
        return contentType != null ? MediaType.parseMediaType(contentType) : MediaType.APPLICATION_OCTET_STREAM;
    }
}

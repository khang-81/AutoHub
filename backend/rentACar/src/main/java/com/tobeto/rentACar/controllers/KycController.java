package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.services.abstracts.UserDocumentService;
import com.tobeto.rentACar.services.dtos.kyc.response.UserDocumentResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@AllArgsConstructor
@CrossOrigin
public class KycController {

    private final UserDocumentService userDocumentService;
    private final JwtService jwtService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserDocumentResponse upload(
            HttpServletRequest request,
            @RequestPart("file") MultipartFile file,
            @RequestParam("documentType") String documentType) {
        int userId = extractUserId(request);
        return userDocumentService.upload(userId, documentType, file);
    }

    @GetMapping("/my")
    public List<UserDocumentResponse> myDocuments(HttpServletRequest request) {
        int userId = extractUserId(request);
        return userDocumentService.listByUser(userId);
    }

    private int extractUserId(HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        return jwtService.extractUserId(token);
    }
}

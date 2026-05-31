package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.services.BusinessMailNotificationSender;
import com.tobeto.rentACar.core.services.FileStorageService;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.entities.concretes.UserDocument;
import com.tobeto.rentACar.repositories.UserDocumentRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.UserDocumentService;
import com.tobeto.rentACar.services.constants.KycConstants;
import com.tobeto.rentACar.services.dtos.kyc.response.UserDocumentResponse;
import com.tobeto.rentACar.services.kyc.KycStatusCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDocumentManager implements UserDocumentService {

    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final BusinessMailNotificationSender businessMailNotificationSender;

    /** Dev/Docker local: tự duyệt khi đủ CCCD + GPLX. Production: false. */
    @Value("${app.kyc.auto-approve:false}")
    private boolean kycAutoApprove;

    @Override
    @Transactional
    public UserDocumentResponse upload(int userId, String documentType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Vui lòng chọn file.");
        }
        if (!KycConstants.DOC_CCCD.equals(documentType) && !KycConstants.DOC_GPLX.equals(documentType)) {
            throw new BusinessException("Loại giấy tờ phải là CCCD hoặc GPLX.");
        }
        User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng."));

        String storedPath;
        try {
            storedPath = fileStorageService.storeKycFile(userId, file);
        } catch (IOException e) {
            throw new BusinessException("Không thể lưu file: " + e.getMessage());
        }

        Optional<UserDocument> existing = userDocumentRepository.findByUser_IdAndDocumentType(userId, documentType);
        UserDocument doc;
        if (existing.isPresent()) {
            doc = existing.get();
            doc.setFilePath(storedPath);
            doc.setStatus(KycConstants.DOC_PENDING);
            doc.setAdminNote(null);
            doc.setReviewedAt(null);
        } else {
            doc = UserDocument.builder()
                    .user(user)
                    .documentType(documentType)
                    .filePath(storedPath)
                    .status(KycConstants.DOC_PENDING)
                    .build();
        }
        userDocumentRepository.save(doc);
        refreshUserKycStatus(userId);
        tryAutoApproveIfEnabled(userId);
        return toResponse(doc);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDocumentResponse> listByUser(int userId) {
        return userDocumentRepository.findByUser_IdWithUser(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDocumentResponse> listPendingForAdmin() {
        return userDocumentRepository.findByStatusWithUser(KycConstants.DOC_PENDING).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDocumentResponse approve(int documentId) {
        UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ."));
        if (!KycConstants.DOC_PENDING.equals(doc.getStatus())) {
            throw new BusinessException("Hồ sơ không ở trạng thái chờ duyệt.");
        }
        doc.setStatus(KycConstants.DOC_APPROVED);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setAdminNote(null);
        userDocumentRepository.save(doc);
        int uid = doc.getUser().getId();
        refreshUserKycStatus(uid);
        userRepository.findById(uid).ifPresent(refreshed -> {
            if (StringUtils.hasText(refreshed.getEmail())
                    && KycConstants.USER_KYC_APPROVED.equals(refreshed.getKycStatus())) {
                businessMailNotificationSender.sendHtmlToUser(
                        refreshed.getEmail(),
                        "[Rent-A-Car] Xác minh danh tính hoàn tất",
                        BusinessMailNotificationSender.simpleHtmlEmail(
                                "KYC đã được duyệt",
                                "Hồ sơ CCCD và GPLX của bạn đã được phê duyệt. Bạn có thể đặt thuê hoặc mua xe trên hệ thống."
                        )
                );
            }
        });
        return toResponse(doc);
    }

    @Override
    @Transactional
    public UserDocumentResponse reject(int documentId, String adminNote) {
        UserDocument doc = userDocumentRepository.findById(documentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ."));
        if (!KycConstants.DOC_PENDING.equals(doc.getStatus())) {
            throw new BusinessException("Hồ sơ không ở trạng thái chờ duyệt.");
        }
        doc.setStatus(KycConstants.DOC_REJECTED);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setAdminNote(adminNote);
        userDocumentRepository.save(doc);
        int uid = doc.getUser().getId();
        refreshUserKycStatus(uid);
        String typeLabel = KycConstants.DOC_CCCD.equals(doc.getDocumentType()) ? "CCCD" : "GPLX";
        userRepository.findById(uid).ifPresent(refreshed -> {
            if (StringUtils.hasText(refreshed.getEmail())) {
                businessMailNotificationSender.sendHtmlToUser(
                        refreshed.getEmail(),
                        "[Rent-A-Car] Cần cập nhật hồ sơ KYC",
                        BusinessMailNotificationSender.simpleHtmlEmail(
                                "Giấy tờ " + typeLabel + " cần bổ sung",
                                "Hồ sơ của bạn chưa được chấp nhật.\nGhi chú từ admin: "
                                        + (adminNote != null && !adminNote.isBlank() ? adminNote : "(không có ghi chú)")
                        )
                );
            }
        });
        return toResponse(doc);
    }

    private void refreshUserKycStatus(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<UserDocument> docs = userDocumentRepository.findByUser_Id(userId);
        user.setKycStatus(KycStatusCalculator.resolveUserKycStatus(docs));
        userRepository.save(user);
    }

    /**
     * Khi {@code app.kyc.auto-approve=true}: duyệt ngay cả bộ CCCD+GPLX đang PENDING (không gửi email).
     * Bật qua env {@code APP_KYC_AUTO_APPROVE=true} (Docker / VPS).
     */
    private void tryAutoApproveIfEnabled(int userId) {
        if (!kycAutoApprove) {
            return;
        }
        List<UserDocument> docs = userDocumentRepository.findByUser_Id(userId);
        if (!KycStatusCalculator.bothDocumentsPending(docs)) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        for (UserDocument doc : docs) {
            if (!KycConstants.DOC_PENDING.equals(doc.getStatus())) {
                continue;
            }
            doc.setStatus(KycConstants.DOC_APPROVED);
            doc.setReviewedAt(now);
            doc.setAdminNote(null);
            userDocumentRepository.save(doc);
        }
        refreshUserKycStatus(userId);
        log.info("Auto-approved KYC for userId={} (app.kyc.auto-approve=true)", userId);
    }

    private UserDocumentResponse toResponse(UserDocument d) {
        UserDocumentResponse r = new UserDocumentResponse();
        r.setId(d.getId());
        r.setUserId(d.getUser() != null ? d.getUser().getId() : null);
        r.setDocumentType(d.getDocumentType());
        r.setFileUrl("/files/" + d.getFilePath().replace("\\", "/"));
        r.setStatus(d.getStatus());
        r.setAdminNote(d.getAdminNote());
        r.setReviewedAt(d.getReviewedAt());
        return r;
    }
}

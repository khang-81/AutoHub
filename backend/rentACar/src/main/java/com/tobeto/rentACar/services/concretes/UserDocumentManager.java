package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.services.FileStorageService;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.entities.concretes.UserDocument;
import com.tobeto.rentACar.repositories.UserDocumentRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.UserDocumentService;
import com.tobeto.rentACar.services.constants.KycConstants;
import com.tobeto.rentACar.services.dtos.kyc.response.UserDocumentResponse;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class UserDocumentManager implements UserDocumentService {

    private final UserDocumentRepository userDocumentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

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
        return toResponse(doc);
    }

    @Override
    public List<UserDocumentResponse> listByUser(int userId) {
        return userDocumentRepository.findByUser_Id(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDocumentResponse> listPendingForAdmin() {
        return userDocumentRepository.findByStatus(KycConstants.DOC_PENDING).stream()
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
        refreshUserKycStatus(doc.getUser().getId());
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
        refreshUserKycStatus(doc.getUser().getId());
        return toResponse(doc);
    }

    private void refreshUserKycStatus(int userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<UserDocument> docs = userDocumentRepository.findByUser_Id(userId);
        Optional<UserDocument> oc = docs.stream()
                .filter(d -> KycConstants.DOC_CCCD.equals(d.getDocumentType()))
                .findFirst();
        Optional<UserDocument> og = docs.stream()
                .filter(d -> KycConstants.DOC_GPLX.equals(d.getDocumentType()))
                .findFirst();

        if (oc.isEmpty() && og.isEmpty()) {
            user.setKycStatus(KycConstants.USER_KYC_NOT_SUBMITTED);
        } else if (oc.isEmpty() || og.isEmpty()) {
            user.setKycStatus(KycConstants.USER_KYC_PENDING);
        } else {
            UserDocument c = oc.get();
            UserDocument g = og.get();
            boolean anyRejected = KycConstants.DOC_REJECTED.equals(c.getStatus())
                    || KycConstants.DOC_REJECTED.equals(g.getStatus());
            boolean bothApproved = KycConstants.DOC_APPROVED.equals(c.getStatus())
                    && KycConstants.DOC_APPROVED.equals(g.getStatus());
            boolean anyPending = KycConstants.DOC_PENDING.equals(c.getStatus())
                    || KycConstants.DOC_PENDING.equals(g.getStatus());

            if (bothApproved) {
                user.setKycStatus(KycConstants.USER_KYC_APPROVED);
            } else if (anyRejected) {
                user.setKycStatus(KycConstants.USER_KYC_REJECTED);
            } else if (anyPending) {
                user.setKycStatus(KycConstants.USER_KYC_PENDING);
            } else {
                user.setKycStatus(KycConstants.USER_KYC_PENDING);
            }
        }
        userRepository.save(user);
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

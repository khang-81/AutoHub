package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.services.dtos.kyc.response.UserDocumentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserDocumentService {

    UserDocumentResponse upload(int userId, String documentType, MultipartFile file);

    List<UserDocumentResponse> listByUser(int userId);

    List<UserDocumentResponse> listPendingForAdmin();

    UserDocumentResponse approve(int documentId);

    UserDocumentResponse reject(int documentId, String adminNote);
}

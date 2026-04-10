package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.services.abstracts.UserDocumentService;
import com.tobeto.rentACar.services.dtos.kyc.request.RejectKycRequest;
import com.tobeto.rentACar.services.dtos.kyc.response.UserDocumentResponse;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/kyc")
@AllArgsConstructor
@CrossOrigin
public class KycAdminController {

    private final UserDocumentService userDocumentService;

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/pending")
    public List<UserDocumentResponse> pending() {
        return userDocumentService.listPendingForAdmin();
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}/approve")
    public UserDocumentResponse approve(@PathVariable int id) {
        return userDocumentService.approve(id);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}/reject")
    public UserDocumentResponse reject(@PathVariable int id, @RequestBody(required = false) RejectKycRequest body) {
        String note = body != null ? body.getAdminNote() : null;
        return userDocumentService.reject(id, note);
    }
}

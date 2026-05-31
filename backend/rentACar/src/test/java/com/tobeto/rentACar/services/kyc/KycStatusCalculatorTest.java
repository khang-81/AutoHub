package com.tobeto.rentACar.services.kyc;

import com.tobeto.rentACar.entities.concretes.UserDocument;
import com.tobeto.rentACar.services.constants.KycConstants;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class KycStatusCalculatorTest {

    private static UserDocument doc(String type, String status) {
        return UserDocument.builder().documentType(type).status(status).build();
    }

    @Test
    void resolveUserKycStatus_noDocs_notSubmitted() {
        assertEquals(KycConstants.USER_KYC_NOT_SUBMITTED, KycStatusCalculator.resolveUserKycStatus(List.of()));
    }

    @Test
    void resolveUserKycStatus_onlyCccd_pending() {
        assertEquals(KycConstants.USER_KYC_PENDING,
                KycStatusCalculator.resolveUserKycStatus(List.of(doc(KycConstants.DOC_CCCD, KycConstants.DOC_PENDING))));
    }

    @Test
    void resolveUserKycStatus_bothPending_userPending() {
        assertEquals(KycConstants.USER_KYC_PENDING, KycStatusCalculator.resolveUserKycStatus(List.of(
                doc(KycConstants.DOC_CCCD, KycConstants.DOC_PENDING),
                doc(KycConstants.DOC_GPLX, KycConstants.DOC_PENDING))));
        assertTrue(KycStatusCalculator.bothDocumentsPending(List.of(
                doc(KycConstants.DOC_CCCD, KycConstants.DOC_PENDING),
                doc(KycConstants.DOC_GPLX, KycConstants.DOC_PENDING))));
    }

    @Test
    void resolveUserKycStatus_bothApproved() {
        assertEquals(KycConstants.USER_KYC_APPROVED, KycStatusCalculator.resolveUserKycStatus(List.of(
                doc(KycConstants.DOC_CCCD, KycConstants.DOC_APPROVED),
                doc(KycConstants.DOC_GPLX, KycConstants.DOC_APPROVED))));
        assertFalse(KycStatusCalculator.bothDocumentsPending(List.of(
                doc(KycConstants.DOC_CCCD, KycConstants.DOC_APPROVED),
                doc(KycConstants.DOC_GPLX, KycConstants.DOC_APPROVED))));
    }

    @Test
    void resolveUserKycStatus_anyRejected() {
        assertEquals(KycConstants.USER_KYC_REJECTED, KycStatusCalculator.resolveUserKycStatus(List.of(
                doc(KycConstants.DOC_CCCD, KycConstants.DOC_REJECTED),
                doc(KycConstants.DOC_GPLX, KycConstants.DOC_PENDING))));
    }
}

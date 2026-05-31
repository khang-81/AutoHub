package com.tobeto.rentACar.services.kyc;

import com.tobeto.rentACar.entities.concretes.UserDocument;
import com.tobeto.rentACar.services.constants.KycConstants;

import java.util.List;
import java.util.Optional;

/**
 * Tính {@code users.kyc_status} từ bộ giấy tờ CCCD + GPLX (logic thuần, dễ unit test).
 */
public final class KycStatusCalculator {

    private KycStatusCalculator() {}

    public static String resolveUserKycStatus(List<UserDocument> docs) {
        Optional<UserDocument> cccd = docs.stream()
                .filter(d -> KycConstants.DOC_CCCD.equals(d.getDocumentType()))
                .findFirst();
        Optional<UserDocument> gplx = docs.stream()
                .filter(d -> KycConstants.DOC_GPLX.equals(d.getDocumentType()))
                .findFirst();

        if (cccd.isEmpty() && gplx.isEmpty()) {
            return KycConstants.USER_KYC_NOT_SUBMITTED;
        }
        if (cccd.isEmpty() || gplx.isEmpty()) {
            return KycConstants.USER_KYC_PENDING;
        }

        UserDocument c = cccd.get();
        UserDocument g = gplx.get();
        boolean anyRejected = KycConstants.DOC_REJECTED.equals(c.getStatus())
                || KycConstants.DOC_REJECTED.equals(g.getStatus());
        boolean bothApproved = KycConstants.DOC_APPROVED.equals(c.getStatus())
                && KycConstants.DOC_APPROVED.equals(g.getStatus());

        if (bothApproved) {
            return KycConstants.USER_KYC_APPROVED;
        }
        if (anyRejected) {
            return KycConstants.USER_KYC_REJECTED;
        }
        return KycConstants.USER_KYC_PENDING;
    }

    /** Cả CCCD và GPLX đều tồn tại và đang chờ duyệt. */
    public static boolean bothDocumentsPending(List<UserDocument> docs) {
        Optional<UserDocument> cccd = docs.stream()
                .filter(d -> KycConstants.DOC_CCCD.equals(d.getDocumentType()))
                .findFirst();
        Optional<UserDocument> gplx = docs.stream()
                .filter(d -> KycConstants.DOC_GPLX.equals(d.getDocumentType()))
                .findFirst();
        if (cccd.isEmpty() || gplx.isEmpty()) {
            return false;
        }
        return KycConstants.DOC_PENDING.equals(cccd.get().getStatus())
                && KycConstants.DOC_PENDING.equals(gplx.get().getStatus());
    }
}

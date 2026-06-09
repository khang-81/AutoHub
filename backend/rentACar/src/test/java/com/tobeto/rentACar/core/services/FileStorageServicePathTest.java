package com.tobeto.rentACar.core.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FileStorageServicePathTest {

    @Test
    void normalizeRelativeStoredPath_stripsUploadsPrefix() {
        assertEquals(
                "kyc/demo-gplx-user.pdf",
                FileStorageService.normalizeRelativeStoredPath("uploads/kyc/demo-gplx-user.pdf"));
    }

    @Test
    void normalizeRelativeStoredPath_keepsNewFormat() {
        assertEquals(
                "kyc/user_1/abc.png",
                FileStorageService.normalizeRelativeStoredPath("kyc/user_1/abc.png"));
    }
}

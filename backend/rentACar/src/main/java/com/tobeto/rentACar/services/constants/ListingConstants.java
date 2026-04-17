package com.tobeto.rentACar.services.constants;

/**
 * Loại niêm yết xe và trạng thái bán — phục vụ module thuê + bán.
 */
public final class ListingConstants {

    private ListingConstants() {
    }

    public static final String LISTING_RENT_ONLY = "RENT_ONLY";
    public static final String LISTING_SALE_ONLY = "SALE_ONLY";
    public static final String LISTING_BOTH = "BOTH";

    public static final String SALE_AVAILABLE = "AVAILABLE";
    public static final String SALE_RESERVED = "RESERVED";
    public static final String SALE_SOLD = "SOLD";

    public static final String SALE_ORDER_PENDING_PAYMENT = "PENDING_PAYMENT";
    public static final String SALE_ORDER_PENDING_ADMIN = "PENDING_ADMIN_CONFIRM";
    public static final String SALE_ORDER_COMPLETED = "COMPLETED";
    public static final String SALE_ORDER_CANCELLED = "CANCELLED";
}


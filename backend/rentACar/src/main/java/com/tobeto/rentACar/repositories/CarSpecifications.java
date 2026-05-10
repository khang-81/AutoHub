package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Brand;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.Model;
import com.tobeto.rentACar.entities.concretes.Rental;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public final class CarSpecifications {

    private CarSpecifications() {
    }

    /**
     * Trạng thái rental coi là "đang chiếm lịch" — overlap với đơn này thì xe coi như bận.
     * COMPLETED / CANCELLED không tính (đã trả xe / huỷ).
     */
    private static final Set<String> ACTIVE_RENTAL_STATUSES = Set.of(
            "PENDING_PAYMENT",
            "PENDING_ADMIN_CONFIRM",
            "CONFIRMED",
            "DISPUTE"
    );

    /**
     * @param listing      "" | rent | sale (không phân biệt hoa thường)
     * @param seats        số chỗ ngồi cần khớp chính xác (chỉ áp dụng listing=rent)
     * @param transmission AUTO | MANUAL — case-insensitive
     * @param fuelType     GASOLINE | DIESEL | HYBRID | ELECTRIC — case-insensitive
     * @param availableFrom / availableTo  Khoảng [from,to] khách muốn thuê. Cả 2 cần có để áp filter.
     */
    public static Specification<Car> withFilters(
            Integer brandId,
            Integer colorId,
            Double minPrice,
            Double maxPrice,
            Integer minYear,
            String listing,
            String q,
            Integer seats,
            String transmission,
            String fuelType,
            LocalDate availableFrom,
            LocalDate availableTo) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (brandId != null) {
                predicates.add(cb.equal(root.get("model").get("brand").get("id"), brandId));
            }
            if (colorId != null) {
                predicates.add(cb.equal(root.get("color").get("id"), colorId));
            }
            if (minYear != null) {
                predicates.add(cb.ge(root.get("modelYear"), minYear.shortValue()));
            }

            String list = listing == null ? "" : listing.trim().toLowerCase(Locale.ROOT);
            switch (list) {
                case "rent" -> predicates.add(cb.or(
                        cb.equal(root.get("listingType"), "RENT_ONLY"),
                        cb.isNull(root.get("listingType")),
                        cb.equal(root.get("listingType"), "")
                ));
                case "sale" -> predicates.add(cb.or(
                        cb.equal(root.get("listingType"), "SALE_ONLY")
                ));
                default -> {
                }
            }

            if ("sale".equals(list)) {
                if (minPrice != null) {
                    predicates.add(cb.ge(root.get("salePrice"), minPrice.floatValue()));
                }
                if (maxPrice != null) {
                    predicates.add(cb.le(root.get("salePrice"), maxPrice.floatValue()));
                }
            } else {
                if (minPrice != null) {
                    predicates.add(cb.ge(root.get("dailyPrice"), minPrice.floatValue()));
                }
                if (maxPrice != null) {
                    predicates.add(cb.le(root.get("dailyPrice"), maxPrice.floatValue()));
                }
            }

            // Filter mới chỉ có nghĩa cho xe thuê — không apply khi đang xem catalog bán.
            boolean rentMode = !"sale".equals(list);
            if (rentMode) {
                if (seats != null && seats > 0) {
                    predicates.add(cb.equal(root.get("seats"), seats));
                }
                if (transmission != null && !transmission.isBlank()) {
                    predicates.add(cb.equal(cb.upper(root.get("transmission")),
                            transmission.trim().toUpperCase(Locale.ROOT)));
                }
                if (fuelType != null && !fuelType.isBlank()) {
                    predicates.add(cb.equal(cb.upper(root.get("fuelType")),
                            fuelType.trim().toUpperCase(Locale.ROOT)));
                }

                // Availability: loại bỏ xe có rental overlap [from,to].
                // Overlap khi rental.startDate <= to AND rental.endDate >= from.
                if (availableFrom != null && availableTo != null && !availableFrom.isAfter(availableTo)
                        && query != null) {
                    Subquery<Integer> sub = query.subquery(Integer.class);
                    var rentalRoot = sub.from(Rental.class);
                    sub.select(rentalRoot.get("car").get("id"))
                            .where(cb.and(
                                    cb.lessThanOrEqualTo(rentalRoot.get("startDate"), availableTo),
                                    cb.greaterThanOrEqualTo(rentalRoot.get("endDate"), availableFrom),
                                    rentalRoot.get("rentalStatus").in(ACTIVE_RENTAL_STATUSES)
                            ));
                    predicates.add(cb.not(root.get("id").in(sub)));
                }
            }

            if (q != null && !q.isBlank()) {
                String safe = q.trim().toLowerCase(Locale.ROOT).replace("%", "").replace("_", "");
                if (!safe.isEmpty()) {
                    String pattern = "%" + safe + "%";
                    Join<Car, Model> model = root.join("model", JoinType.INNER);
                    Join<Model, Brand> brand = model.join("brand", JoinType.INNER);
                    Predicate plate = cb.like(cb.lower(root.get("plate")), pattern);
                    Predicate modelName = cb.like(cb.lower(model.get("name")), pattern);
                    Predicate brandName = cb.like(cb.lower(brand.get("name")), pattern);
                    predicates.add(cb.or(plate, modelName, brandName));
                    if (query != null) {
                        query.distinct(true);
                    }
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

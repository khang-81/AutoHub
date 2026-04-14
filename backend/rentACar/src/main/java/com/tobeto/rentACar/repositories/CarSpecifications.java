package com.tobeto.rentACar.repositories;

import com.tobeto.rentACar.entities.concretes.Brand;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.Model;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class CarSpecifications {

    private CarSpecifications() {
    }

    /**
     * @param listing "" | rent | sale (không phân biệt hoa thường)
     */
    public static Specification<Car> withFilters(
            Integer brandId,
            Integer colorId,
            Double minPrice,
            Double maxPrice,
            Integer minYear,
            String listing,
            String q) {

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
                        cb.equal(root.get("listingType"), "BOTH"),
                        cb.isNull(root.get("listingType")),
                        cb.equal(root.get("listingType"), "")
                ));
                case "sale" -> predicates.add(cb.or(
                        cb.equal(root.get("listingType"), "SALE_ONLY"),
                        cb.equal(root.get("listingType"), "BOTH")
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
                    query.distinct(true);
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

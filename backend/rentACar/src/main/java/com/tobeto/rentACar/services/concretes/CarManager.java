package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.CarImage;
import com.tobeto.rentACar.repositories.CarImageRepository;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.CarSpecifications;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.services.abstracts.CarService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.car.request.AddCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.CarImageRequest;
import com.tobeto.rentACar.services.dtos.car.request.DeleteCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.UpdateCarRequest;
import com.tobeto.rentACar.services.dtos.car.response.CarImageResponse;
import com.tobeto.rentACar.services.dtos.car.response.GetAllCarsResponse;
import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.car.response.PagedCarsResponse;
import com.tobeto.rentACar.services.constants.ListingConstants;
import com.tobeto.rentACar.services.rules.CarBusinessRule;
import com.tobeto.rentACar.services.rules.ColorBusinessRule;
import com.tobeto.rentACar.services.rules.ModelBusinessRule;
import lombok.AllArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;


@Service
@AllArgsConstructor
public class CarManager implements CarService {
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final RentalRepository rentalRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final ReviewRepository reviewRepository;
    private final ModelMapperService modelMapperService;
    private final CarBusinessRule carBusinessRule;
    private final ModelBusinessRule modelBusinessRule;
    private final ColorBusinessRule colorBusinessRule;
    private MessageService messageService;

    @Override
    public List<GetAllCarsResponse> getAll() {
        List<Car> cars = carRepository.findAll();
        Map<Integer, double[]> ratingByCar = buildRatingStatsMap();
        return cars.stream().map((car) -> {
            GetAllCarsResponse r = this.modelMapperService.forResponse().map(car, GetAllCarsResponse.class);
            applyRatingStats(r, car.getId(), ratingByCar);
            applyListingDefaults(r);
            return r;
        }).toList();
    }

    @Override
    public PagedCarsResponse search(
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
            LocalDate availableTo,
            int page,
            int size) {

        int pageOneBased = Math.max(1, page);
        int pageSize = Math.min(50, Math.max(1, size));
        int pageIndex = pageOneBased - 1;

        Specification<Car> spec = CarSpecifications.withFilters(
                brandId, colorId, minPrice, maxPrice, minYear, listing, q,
                seats, transmission, fuelType, availableFrom, availableTo);
        Page<Car> result = carRepository.findAll(
                spec,
                PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "id")));

        Map<Integer, double[]> ratingByCar = buildRatingStatsMap();
        List<GetAllCarsResponse> content = result.getContent().stream().map((car) -> {
            GetAllCarsResponse r = this.modelMapperService.forResponse().map(car, GetAllCarsResponse.class);
            applyRatingStats(r, car.getId(), ratingByCar);
            applyListingDefaults(r);
            return r;
        }).toList();

        return new PagedCarsResponse(
                content,
                result.getTotalElements(),
                result.getTotalPages(),
                pageOneBased,
                pageSize);
    }

    @Override
    public GetCarByIdResponse getById(int id) {

        Car car = carRepository.findById(id).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));

        GetCarByIdResponse r = this.modelMapperService.forResponse()
                .map(car, GetCarByIdResponse.class);
        Map<Integer, double[]> ratingByCar = buildRatingStatsMap();
        applyRatingStats(r, id, ratingByCar);
        applyListingDefaults(r);
        r.setImages(carImageRepository.findByCar_IdOrderBySortOrderAsc(id).stream()
                .map(img -> new CarImageResponse(img.getImageUrl(), img.getImageType(), img.getSortOrder()))
                .toList());
        return r;
    }

    private static void applyListingDefaults(GetAllCarsResponse r) {
        if (r.getListingType() == null || r.getListingType().isBlank()) {
            r.setListingType(ListingConstants.LISTING_RENT_ONLY);
        }
    }

    private static void applyListingDefaults(GetCarByIdResponse r) {
        if (r.getListingType() == null || r.getListingType().isBlank()) {
            r.setListingType(ListingConstants.LISTING_RENT_ONLY);
        }
    }

    private void validateListingAdd(com.tobeto.rentACar.services.dtos.car.request.AddCarRequest request) {
        String lt = request.getListingType() == null || request.getListingType().isBlank()
                ? ListingConstants.LISTING_RENT_ONLY
                : request.getListingType().trim().toUpperCase();
        switch (lt) {
            case ListingConstants.LISTING_RENT_ONLY -> {
                if (request.getDailyPrice() == null || request.getDailyPrice() <= 0) {
                    throw new BusinessException("Giá thuê/ngày phải lớn hơn 0.");
                }
                request.setSalePrice(null);
                request.setDailyPrice(request.getDailyPrice());
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_SALE_ONLY -> {
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                request.setDailyPrice(0f);
                request.setListingType(lt);
            }
            default -> throw new BusinessException("listingType không hợp lệ (RENT_ONLY, SALE_ONLY).");
        }
    }

    private void validateListingUpdate(com.tobeto.rentACar.services.dtos.car.request.UpdateCarRequest request) {
        String lt = request.getListingType() == null || request.getListingType().isBlank()
                ? ListingConstants.LISTING_RENT_ONLY
                : request.getListingType().trim().toUpperCase();
        switch (lt) {
            case ListingConstants.LISTING_RENT_ONLY -> {
                if (request.getDailyPrice() == null || request.getDailyPrice() <= 0) {
                    throw new BusinessException("Giá thuê/ngày phải lớn hơn 0.");
                }
                request.setSalePrice(null);
                request.setDailyPrice(request.getDailyPrice());
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_SALE_ONLY -> {
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                request.setDailyPrice(0f);
                request.setListingType(lt);
            }
            default -> throw new BusinessException("listingType không hợp lệ (RENT_ONLY, SALE_ONLY).");
        }
    }

    private Map<Integer, double[]> buildRatingStatsMap() {
        Map<Integer, double[]> map = new HashMap<>();
        for (Object[] row : reviewRepository.findAverageRatingStatsByCar()) {
            Integer carId = (Integer) row[0];
            double avg = ((Number) row[1]).doubleValue();
            long count = ((Number) row[2]).longValue();
            map.put(carId, new double[]{avg, count});
        }
        return map;
    }

    private static void applyRatingStats(GetAllCarsResponse dto, int carId, Map<Integer, double[]> ratingByCar) {
        double[] s = ratingByCar.get(carId);
        if (s != null) {
            dto.setAverageRating(Math.round(s[0] * 10.0) / 10.0);
            dto.setReviewCount((int) s[1]);
        }
    }

    private static void applyRatingStats(GetCarByIdResponse dto, int carId, Map<Integer, double[]> ratingByCar) {
        double[] s = ratingByCar.get(carId);
        if (s != null) {
            dto.setAverageRating(Math.round(s[0] * 10.0) / 10.0);
            dto.setReviewCount((int) s[1]);
        }
    }

    private static void applySaleStatusOnCar(Car car) {
        String lt = car.getListingType();
        if (lt == null || lt.isBlank()) {
            car.setListingType(ListingConstants.LISTING_RENT_ONLY);
            lt = ListingConstants.LISTING_RENT_ONLY;
        }
        if (ListingConstants.LISTING_RENT_ONLY.equalsIgnoreCase(lt)) {
            car.setSalePrice(null);
            car.setSaleStatus(null);
            return;
        }
        car.setSaleStatus(ListingConstants.SALE_AVAILABLE);
    }

    private static final Set<String> ALLOWED_TRANSMISSIONS = Set.of("AUTO", "MANUAL");
    private static final Set<String> ALLOWED_FUEL_TYPES = Set.of("GASOLINE", "DIESEL", "HYBRID", "ELECTRIC");

    /**
     * Chuẩn hoá transmission/fuelType về uppercase và validate trong tập hợp cho phép.
     * Cho phép null (chưa khai báo) — Specification chỉ filter khi tham số có giá trị.
     */
    private static void normalizeAndValidateRentalSpecs(Car car) {
        if (car.getTransmission() != null && !car.getTransmission().isBlank()) {
            String t = car.getTransmission().trim().toUpperCase(Locale.ROOT);
            if (!ALLOWED_TRANSMISSIONS.contains(t)) {
                throw new BusinessException("Hộp số không hợp lệ (AUTO hoặc MANUAL).");
            }
            car.setTransmission(t);
        } else {
            car.setTransmission(null);
        }
        if (car.getFuelType() != null && !car.getFuelType().isBlank()) {
            String f = car.getFuelType().trim().toUpperCase(Locale.ROOT);
            if (!ALLOWED_FUEL_TYPES.contains(f)) {
                throw new BusinessException("Loại nhiên liệu không hợp lệ (GASOLINE/DIESEL/HYBRID/ELECTRIC).");
            }
            car.setFuelType(f);
        } else {
            car.setFuelType(null);
        }
        if (car.getSeats() != null && (car.getSeats() < 2 || car.getSeats() > 16)) {
            throw new BusinessException("Số chỗ ngồi phải trong khoảng 2-16.");
        }
    }

    private static void validateCarImages(List<CarImageRequest> images) {
        if (images == null || images.isEmpty()) {
            throw new BusinessException("Cần đủ 5 ảnh gallery (3 ngoại thất + 2 nội thất).");
        }
        if (images.size() != 5) {
            throw new BusinessException("Cần đúng 5 ảnh gallery (3 ngoại + 2 nội).");
        }
        long exterior = images.stream()
                .filter(i -> "EXTERIOR".equalsIgnoreCase(i.getImageType()))
                .count();
        long interior = images.stream()
                .filter(i -> "INTERIOR".equalsIgnoreCase(i.getImageType()))
                .count();
        if (exterior != 3 || interior != 2) {
            throw new BusinessException("Gallery phải có 3 ảnh EXTERIOR và 2 ảnh INTERIOR.");
        }
        for (CarImageRequest img : images) {
            if (img.getImageUrl() == null || img.getImageUrl().isBlank()) {
                throw new BusinessException("Mỗi ảnh gallery cần URL hoặc file đã upload.");
            }
            if (img.getSortOrder() == null || img.getSortOrder() < 1 || img.getSortOrder() > 5) {
                throw new BusinessException("sortOrder gallery phải từ 1 đến 5.");
            }
        }
    }

    private static String resolveCoverImagePath(List<CarImageRequest> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        return images.stream()
                .min(Comparator.comparing(CarImageRequest::getSortOrder))
                .map(CarImageRequest::getImageUrl)
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .orElse(null);
    }

    private void persistCarImages(Car car, List<CarImageRequest> images) {
        validateCarImages(images);
        carImageRepository.deleteByCar_Id(car.getId());
        images.stream()
                .sorted(Comparator.comparing(CarImageRequest::getSortOrder))
                .forEach(req -> {
                    CarImage row = new CarImage();
                    row.setCar(car);
                    row.setImageUrl(req.getImageUrl().trim());
                    row.setSortOrder(req.getSortOrder().shortValue());
                    row.setImageType(req.getImageType().trim().toUpperCase(Locale.ROOT));
                    carImageRepository.save(row);
                });
    }

    @Override
    @Transactional
    public Result add(AddCarRequest request) {

        //The input is converted as compatible with the database
        request.setPlate(request.getPlate().replaceAll("[\\s-]", ""));

        validateListingAdd(request);

        carBusinessRule.existsCarByPlate(request.getPlate());
        modelBusinessRule.existsModelById(request.getModelId());
        colorBusinessRule.existsColorById(request.getColorId());

        Car car = this.modelMapperService.forRequest().map(request, Car.class);
        if (car.getServiceCity() == null || car.getServiceCity().isBlank()) {
            car.setServiceCity("Hà Nội");
        }
        applySaleStatusOnCar(car);
        normalizeAndValidateRentalSpecs(car);

        String cover = resolveCoverImagePath(request.getImages());
        if (cover != null) {
            car.setImagePath(cover);
        }

        carRepository.save(car);
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            persistCarImages(car, request.getImages());
        }

        return new SuccessResult(messageService.getMessage(Messages.Car.carAddSuccess));
    }

    @Override
    @Transactional
    public Result update(UpdateCarRequest request) {

        //The input is converted as compatible with the database
        request.setPlate(request.getPlate().replaceAll("[\\s-]", ""));

        Car existing = carRepository.findById(request.getId()).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));

        validateListingUpdate(request);

        carBusinessRule.assertPlateNotUsedByOtherCar(request.getId(), request.getPlate());
        modelBusinessRule.existsModelById(request.getModelId());
        colorBusinessRule.existsColorById(request.getColorId());

        Car car = this.modelMapperService.forRequest().map(request, Car.class);
        car.setVersion(existing.getVersion());
        if (ListingConstants.SALE_SOLD.equalsIgnoreCase(existing.getSaleStatus())) {
            car.setSaleStatus(ListingConstants.SALE_SOLD);
            if (car.getSalePrice() == null || car.getSalePrice() <= 0) {
                car.setSalePrice(existing.getSalePrice());
            }
        } else if (ListingConstants.SALE_RESERVED.equalsIgnoreCase(existing.getSaleStatus())) {
            car.setSaleStatus(ListingConstants.SALE_RESERVED);
        } else {
            applySaleStatusOnCar(car);
        }
        normalizeAndValidateRentalSpecs(car);

        String cover = resolveCoverImagePath(request.getImages());
        if (cover != null) {
            car.setImagePath(cover);
        }

        carRepository.save(car);
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            persistCarImages(car, request.getImages());
        }

        return new SuccessResult(messageService.getMessage(Messages.Car.carUpdateSuccess));

    }

    @Override
    public Result delete(DeleteCarRequest request) {

        carBusinessRule.existsCarById(request.getId());

        if (rentalRepository.existsActiveByCarId(request.getId())) {
            throw new BusinessException("Không thể xóa xe — còn đơn thuê đang hoạt động.");
        }
        if (saleOrderRepository.existsActiveByCarId(request.getId())) {
            throw new BusinessException("Không thể xóa xe — còn đơn mua đang hoạt động.");
        }

        carRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.Car.carDeleteSuccess));

    }

}

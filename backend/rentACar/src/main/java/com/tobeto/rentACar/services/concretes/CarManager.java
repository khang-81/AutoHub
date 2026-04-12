package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.CarSpecifications;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.services.abstracts.CarService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.car.request.AddCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.DeleteCarRequest;
import com.tobeto.rentACar.services.dtos.car.request.UpdateCarRequest;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
@AllArgsConstructor
public class CarManager implements CarService {
    private final CarRepository carRepository;
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
            int page,
            int size) {

        int pageOneBased = Math.max(1, page);
        int pageSize = Math.min(50, Math.max(1, size));
        int pageIndex = pageOneBased - 1;

        Specification<Car> spec = CarSpecifications.withFilters(brandId, colorId, minPrice, maxPrice, minYear, listing, q);
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
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_SALE_ONLY -> {
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                if (request.getDailyPrice() == null) {
                    request.setDailyPrice(0f);
                }
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_BOTH -> {
                if (request.getDailyPrice() == null || request.getDailyPrice() <= 0) {
                    throw new BusinessException("Giá thuê/ngày phải lớn hơn 0.");
                }
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                request.setListingType(lt);
            }
            default -> throw new BusinessException("listingType không hợp lệ (RENT_ONLY, SALE_ONLY, BOTH).");
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
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_SALE_ONLY -> {
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                if (request.getDailyPrice() == null) {
                    request.setDailyPrice(0f);
                }
                request.setListingType(lt);
            }
            case ListingConstants.LISTING_BOTH -> {
                if (request.getDailyPrice() == null || request.getDailyPrice() <= 0) {
                    throw new BusinessException("Giá thuê/ngày phải lớn hơn 0.");
                }
                if (request.getSalePrice() == null || request.getSalePrice() <= 0) {
                    throw new BusinessException("Giá bán phải lớn hơn 0.");
                }
                request.setListingType(lt);
            }
            default -> throw new BusinessException("listingType không hợp lệ (RENT_ONLY, SALE_ONLY, BOTH).");
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

    @Override
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

        carRepository.save(car);

        return new SuccessResult(messageService.getMessage(Messages.Car.carAddSuccess));
    }

    @Override
    public Result update(UpdateCarRequest request) {

        //The input is converted as compatible with the database
        request.setPlate(request.getPlate().replaceAll("[\\s-]", ""));

        Car existing = carRepository.findById(request.getId()).orElseThrow(() ->
                new NotFoundException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));

        validateListingUpdate(request);

        carBusinessRule.existsCarByPlate(request.getPlate());
        modelBusinessRule.existsModelById(request.getModelId());
        colorBusinessRule.existsColorById(request.getColorId());

        Car car = this.modelMapperService.forRequest().map(request, Car.class);
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

        carRepository.save(car);

        return new SuccessResult(messageService.getMessage(Messages.Car.carUpdateSuccess));

    }

    @Override
    public Result delete(DeleteCarRequest request) {

        carBusinessRule.existsCarById(request.getId());

        carRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.Car.carDeleteSuccess));

    }

}

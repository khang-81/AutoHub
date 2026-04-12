package com.tobeto.rentACar.services.rules;

import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.User;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.constants.KycConstants;
import com.tobeto.rentACar.services.constants.ListingConstants;
import com.tobeto.rentACar.services.constants.Messages;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@AllArgsConstructor
public class RentalBusinessRule {
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final MessageService messageService;

    public void existsRentalById(int id) {
        if (!rentalRepository.existsById(id)) {
            throw new BusinessException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage));
        }
    }

    public void checkRentalPeriod(LocalDate startDate, LocalDate endDate) {
        // One vehicle can be rented for a maximum of 25 days.
        if (ChronoUnit.DAYS.between(startDate, endDate) > 25) {
            throw new BusinessException(messageService.getMessage(Messages.Rental.rentalPeriodExceedsLimit));
        }
    }

    public void checkStartDate(LocalDate startDate) {
        // The start date given when renting a car cannot be later than today.
        if (startDate.isBefore(LocalDate.now())) {
            throw new BusinessException(messageService.getMessage(Messages.Rental.startDateInPast));
        }
    }

    public void checkEndDate(LocalDate startDate, LocalDate endDate) {
        // The end date given when renting a car cannot be later than the start date.
        if (endDate.isBefore(startDate)) {
            throw new BusinessException(messageService.getMessage(Messages.Rental.endDateBeforeStartDate));
        }
    }

    public void existsUserById(int userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(messageService.getMessage(Messages.User.getUserNotFoundMessage));
        }
    }

    public void existsCarById(int carId) {
        if (!carRepository.existsById(carId)) {
            throw new BusinessException(messageService.getMessage(Messages.Car.getCarNotFoundMessage));
        }
    }

    public void checkCarAvailability(int carId, LocalDate startDate, LocalDate endDate) {
        boolean overlap = rentalRepository.existsActiveOverlap(carId, startDate, endDate);
        if (overlap) {
            throw new BusinessException("Xe đang được thuê trong khoảng thời gian này.");
        }
    }

    /** Dùng chung cho đặt thuê và đặt mua. */
    public void checkUserKycApproved(int userId) {
        User user = userRepository.findById(userId).orElseThrow(
                () -> new BusinessException(messageService.getMessage(Messages.User.getUserNotFoundMessage)));
        String k = user.getKycStatus();
        if (k == null || !KycConstants.USER_KYC_APPROVED.equals(k)) {
            throw new BusinessException(
                    "Vui lòng tải lên và được duyệt CCCD cùng GPLX trước khi đặt xe.");
        }
    }

    public void checkCarAllowsRental(int carId) {
        Car car = carRepository.findById(carId).orElseThrow(
                () -> new BusinessException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));
        String lt = car.getListingType();
        if (lt == null || lt.isBlank()) {
            lt = ListingConstants.LISTING_RENT_ONLY;
        }
        if (ListingConstants.LISTING_SALE_ONLY.equalsIgnoreCase(lt)) {
            throw new BusinessException("Xe này chỉ bán, không cho thuê.");
        }
        if (ListingConstants.LISTING_BOTH.equalsIgnoreCase(lt) || ListingConstants.LISTING_RENT_ONLY.equalsIgnoreCase(lt)) {
            String ss = car.getSaleStatus();
            if (ss != null && (ListingConstants.SALE_RESERVED.equalsIgnoreCase(ss)
                    || ListingConstants.SALE_SOLD.equalsIgnoreCase(ss))) {
                throw new BusinessException("Xe đang giữ chỗ bán hoặc đã bán, không thể thuê.");
            }
        }
        if (car.getDailyPrice() == null || car.getDailyPrice() <= 0) {
            throw new BusinessException("Xe chưa có giá thuê hợp lệ.");
        }
    }

}

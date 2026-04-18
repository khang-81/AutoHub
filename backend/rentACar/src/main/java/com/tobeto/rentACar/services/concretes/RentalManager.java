package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.BusinessMailNotificationSender;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Rental;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.RentalRepository;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.CarService;
import com.tobeto.rentACar.services.abstracts.InvoiceService;
import com.tobeto.rentACar.services.abstracts.RentalService;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.invoice.request.AddInvoiceRequest;
import com.tobeto.rentACar.services.dtos.rental.request.AddRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.DeleteRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.FindRentalIdRequest;
import com.tobeto.rentACar.services.dtos.rental.request.UpdateRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.UserReturnCarRequest;
import com.tobeto.rentACar.services.dtos.rental.response.*;

import com.tobeto.rentACar.services.policy.RentalPolicy;
import com.tobeto.rentACar.services.rules.RentalBusinessRule;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;

@Service
@AllArgsConstructor
public class RentalManager implements RentalService {

    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    private final ModelMapperService modelMapperService;
    private final CarService carService;
    private final InvoiceService invoiceService;
    private final List<RentalBusinessRule> rentalBusinessRules;
    private final BusinessMailNotificationSender businessMailNotificationSender;
    private MessageService messageService;

    @Override
    public AddRentalResponse add(AddRentalRequest request) {

        for (RentalBusinessRule rule : rentalBusinessRules) {
            rule.checkRentalPeriod(request.getStartDate(), request.getEndDate());
            rule.checkStartDate(request.getStartDate());
            rule.checkEndDate(request.getStartDate(), request.getEndDate());
            rule.existsUserById(request.getUserId());
            rule.existsCarById(request.getCarId());
            rule.checkCarAvailability(request.getCarId(), request.getStartDate(), request.getEndDate());
            rule.checkUserKycApproved(request.getUserId());
            rule.checkCarAllowsRental(request.getCarId());
        }

        // When renting, the StartKilometer should be taken from the Kilometer field of
        // the vehicle to be rented.
        GetCarByIdResponse car = carService.getById(request.getCarId());
        Long currentCarKilometer = car.getKilometer();

        Float dailyPrice = car.getDailyPrice();
        long rentalDays = request.getStartDate().isEqual(request.getEndDate())
                ? 1L
                : ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        double baseRental = dailyPrice * rentalDays;

        String insCode = request.getInsuranceCode();
        if (insCode == null || insCode.isBlank()) {
            insCode = "NONE";
        } else {
            insCode = insCode.trim().toUpperCase();
        }
        double insFeePerDay;
        try {
            insFeePerDay = RentalPolicy.insuranceFeePerDay("NONE".equals(insCode) ? null : insCode);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(e.getMessage());
        }
        double insuranceTotal = insFeePerDay * rentalDays;

        double extras = request.getExtraFeesAmount() != null ? Math.max(0, request.getExtraFeesAmount()) : 0;

        double totalPrice = baseRental + insuranceTotal + extras;
        double depositAmount = RentalPolicy.computeDeposit(totalPrice);

        Rental rental = modelMapperService.forRequest().map(request, Rental.class);
        rental.setUser(userRepository.getReferenceById(request.getUserId()));
        rental.setCar(carRepository.getReferenceById(request.getCarId()));
        rental.setStartKilometer(currentCarKilometer);
        rental.setTotalPrice(totalPrice);
        rental.setInsuranceCode(insCode);
        rental.setInsuranceFeeAmount(insuranceTotal);
        rental.setExtraFeesAmount(extras);
        rental.setPickupDistrict(request.getPickupDistrict());
        rental.setDepositAmount(depositAmount);
        rental.setDepositStatus("PENDING");
        if ("BANK_TRANSFER".equals(request.getPaymentMethod())) {
            rental.setPaymentStatus("PENDING_TRANSFER");
            rental.setRentalStatus("PENDING_PAYMENT");
        } else {
            rental.setPaymentStatus("UNPAID");
            rental.setRentalStatus("PENDING_ADMIN_CONFIRM");
        }
        Rental savedRental = rentalRepository.save(rental);

        // Auto-create invoice right after successful booking so user pages can show
        // invoice data immediately.
        AddInvoiceRequest invoiceRequest = new AddInvoiceRequest();
        invoiceRequest.setInvoiceNo("INV-" + savedRental.getId() + "-" + System.currentTimeMillis());
        invoiceRequest.setTotalPrice((float) totalPrice);
        invoiceRequest.setDiscountRate(0f);
        invoiceRequest.setTaxRate(10f);
        invoiceRequest.setRentalId(savedRental.getId());
        invoiceService.add(invoiceRequest);

        Result result = new SuccessResult(messageService.getMessage(Messages.Rental.rentalAddSuccess));

        AddRentalResponse addRentalResponse = new AddRentalResponse();
        addRentalResponse.setId(savedRental.getId());
        addRentalResponse.setResult(result);

        return (addRentalResponse);

    }

    @Override
    public Result update(UpdateRentalRequest request) {

        for (RentalBusinessRule rule : rentalBusinessRules) {
            rule.existsRentalById(request.getId());
            rule.checkRentalPeriod(request.getStartDate(), request.getEndDate());
            rule.checkStartDate(request.getStartDate());
            rule.checkEndDate(request.getStartDate(), request.getEndDate());
            rule.existsUserById(request.getUserId());
            rule.existsCarById(request.getCarId());
        }

        Rental existingRental = rentalRepository.findById(request.getId()).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        // Mapping
        Rental rental = modelMapperService.forRequest().map(request, Rental.class);
        rental.setPaymentMethod(existingRental.getPaymentMethod());
        rental.setPaymentStatus(existingRental.getPaymentStatus());
        rental.setRentalStatus(existingRental.getRentalStatus());

        // Updating
        if (request.getReturnDate() != null) {
            rental.setRentalStatus("COMPLETED");
        }
        rentalRepository.save(rental);

        return new SuccessResult(messageService.getMessage(Messages.Rental.rentalUpdateSuccess));

    }

    @Override
    public Result delete(DeleteRentalRequest request) {

        RentalBusinessRule rule = rentalBusinessRules.get(0);

        rule.existsRentalById(request.getId());

        // Deleting
        rentalRepository.deleteById(request.getId());

        return new SuccessResult(messageService.getMessage(Messages.Rental.rentalDeleteSuccess));

    }

    @Override
    public List<GetAllRentalsResponse> getAll() {
        List<Rental> rentals = rentalRepository.findAll();
        List<GetAllRentalsResponse> rentalsResponse = rentals.stream()
                .map(rental -> this.modelMapperService.forResponse()
                        .map(rental, GetAllRentalsResponse.class))
                .toList();
        return rentalsResponse;
    }

    @Override
    public List<RentalBusyRangeResponse> getPublicBusyRangesForCar(int carId) {
        if (!carRepository.existsById(carId)) {
            throw new NotFoundException(messageService.getMessage(Messages.Car.getCarNotFoundMessage));
        }
        return rentalRepository.findBlockingRentalsForPublicCalendar(carId).stream()
                .map(r -> new RentalBusyRangeResponse(r.getStartDate(), r.getEndDate()))
                .toList();
    }

    @Override
    public GetRentalByIdResponse getById(int id, int actorUserId, boolean isAdmin) {

        Rental rental = rentalRepository.findById(id).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        if (!isAdmin && (rental.getUser() == null || rental.getUser().getId() != actorUserId)) {
            throw new BusinessException("Bạn không có quyền xem đơn thuê này.");
        }

        return this.modelMapperService.forResponse()
                .map(rental, GetRentalByIdResponse.class);
    }

    @Override
    public GetRentalIdResponse getRentalId(FindRentalIdRequest request) {
        List<Rental> rentals = rentalRepository.findAll();
        return rentals.stream()
                .filter(rental -> rental.getStartDate().isEqual(request.getStartDate()) &&
                        rental.getEndDate().isEqual(request.getEndDate()) &&
                        rental.getCar().getId() == request.getCarId() &&
                        rental.getUser().getId() == request.getUserId())
                .map(rental -> this.modelMapperService.forResponse()
                        .map(rental, GetRentalIdResponse.class))
                .reduce((first, second) -> second) // Get the last element
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<GetRentalByUserIdResponse> getByUserId(int userId) {
        List<Rental> rentals = rentalRepository.findAllForUserHistoryWithCarGraph(userId);
        return rentals.stream()
                .map(rental -> {
                    GetRentalByUserIdResponse dto = this.modelMapperService.forResponse()
                            .map(rental, GetRentalByUserIdResponse.class);
                    dto.setHasReview(reviewRepository.existsByRental_Id(rental.getId()));
                    return dto;
                })
                .toList();
    }

    @Override
    public Result cancel(int rentalId, int actorUserId, boolean isAdmin, String reason) {
        Rental rental = rentalRepository.findById(rentalId).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        if ("CANCELLED".equals(rental.getRentalStatus()) || "COMPLETED".equals(rental.getRentalStatus())) {
            throw new BusinessException("Không thể hủy đơn ở trạng thái này.");
        }
        if (!isAdmin && (rental.getUser() == null || rental.getUser().getId() != actorUserId)) {
            throw new BusinessException("Bạn không có quyền hủy đơn này.");
        }
        if (!isAdmin && rental.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Không thể hủy đơn đã bắt đầu.");
        }

        double deposit = rental.getDepositAmount() != null ? rental.getDepositAmount() : 0;
        double ratio = RentalPolicy.depositRefundRatio(rental.getStartDate());
        double refund = deposit * ratio;
        double fee = Math.max(0, deposit - refund);

        rental.setCancelledAt(LocalDateTime.now());
        rental.setCancelledBy(isAdmin ? "ADMIN" : "USER");
        rental.setCancellationReason(reason);
        rental.setRefundDepositAmount(refund);
        rental.setCancellationFeeAmount(fee);
        rental.setRentalStatus("CANCELLED");
        rental.setDepositStatus(deposit <= 0 ? "FORFEITED" : (refund <= 0.01 ? "FORFEITED" : "REFUNDED"));
        rental.setPaymentStatus("CANCELLED");
        int rid = rental.getId();
        rentalRepository.save(rental);

        rentalRepository.findUserEmailByRentalId(rid).ifPresent(email -> businessMailNotificationSender.sendHtmlToUser(
                email,
                "[Rent-A-Car] Đơn thuê đã hủy",
                BusinessMailNotificationSender.simpleHtmlEmail(
                        "Đơn thuê #" + rid + " đã hủy",
                        "Đơn đã được hủy (" + rental.getCancelledBy() + ").\nLý do: "
                                + (reason != null && !reason.isBlank() ? reason : "(không có)")
                                + ".\nHoàn cọc dự kiến: " + String.format("%,.0f", refund) + " VNĐ."
                )
        ));

        return new SuccessResult(String.format(
                "Đã hủy đơn. Hoàn cọc dự kiến: %,.0f VNĐ (phí giữ lại: %,.0f VNĐ).", refund, fee));
    }

    @Override
    public Result submitTransfer(int id, int userId) {
        Rental rental = rentalRepository.findById(id).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        String rs = normRentalToken(rental.getRentalStatus());
        String ps = normRentalToken(rental.getPaymentStatus());
        String payMethod = normRentalToken(rental.getPaymentMethod());

        if ("CANCELLED".equals(rs)) {
            throw new BusinessException("Đơn thuê đã bị hủy.");
        }
        if (rental.getUser() == null || rental.getUser().getId() != userId) {
            throw new BusinessException("Bạn không có quyền cập nhật đơn thuê này.");
        }
        if (!"BANK_TRANSFER".equals(payMethod)) {
            throw new BusinessException("Đơn thuê này không dùng phương thức chuyển khoản.");
        }
        // Đã gửi CK — idempotent (kể cả DB lệch: rental=PENDING_ADMIN nhưng payment vẫn PENDING_TRANSFER).
        if ("PENDING_ADMIN_CONFIRM".equals(rs)) {
            if (!"PENDING_CONFIRM".equals(ps) && "PENDING_TRANSFER".equals(ps)) {
                rental.setPaymentStatus("PENDING_CONFIRM");
                rentalRepository.save(rental);
            }
            return new SuccessResult("Đã gửi xác nhận chuyển khoản. Vui lòng chờ admin xác nhận.");
        }
        if ("CONFIRMED".equals(rs) || "COMPLETED".equals(rs)) {
            return new SuccessResult("Đơn đã được xử lý. Xem chi tiết tại lịch sử thuê xe.");
        }
        // Đã bấm gửi nhưng rental_status chưa cập nhật (chỉ payment sang PENDING_CONFIRM).
        if ("PENDING_PAYMENT".equals(rs) && "PENDING_CONFIRM".equals(ps)) {
            rental.setRentalStatus("PENDING_ADMIN_CONFIRM");
            rentalRepository.save(rental);
            return new SuccessResult("Đã gửi xác nhận chuyển khoản. Vui lòng chờ admin xác nhận.");
        }
        if (!"PENDING_PAYMENT".equals(rs)) {
            throw new BusinessException(
                    "Không thể gửi xác nhận lúc này (đơn: " + (rs.isBlank() ? "—" : rs)
                            + ", thanh toán: " + (ps.isBlank() ? "—" : ps) + ").");
        }

        rental.setPaymentStatus("PENDING_CONFIRM");
        rental.setRentalStatus("PENDING_ADMIN_CONFIRM");
        rentalRepository.save(rental);
        return new SuccessResult("Đã gửi xác nhận chuyển khoản. Vui lòng chờ admin xác nhận.");
    }

    /** Chuẩn hóa trạng thái từ DB (khoảng trắng, khác hoa/thường). */
    private static String normRentalToken(String s) {
        if (s == null) {
            return "";
        }
        String t = s.strip().toUpperCase(Locale.ROOT);
        return t.isEmpty() ? "" : t;
    }

    @Override
    public Result confirmByAdmin(int id) {
        Rental rental = rentalRepository.findById(id).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        if ("CANCELLED".equals(rental.getRentalStatus())) {
            throw new BusinessException("Đơn thuê đã bị hủy.");
        }
        if ("BANK_TRANSFER".equals(rental.getPaymentMethod())) {
            if (!"PENDING_CONFIRM".equals(rental.getPaymentStatus())) {
                throw new BusinessException("Khách hàng chưa gửi xác nhận chuyển khoản.");
            }
            rental.setPaymentStatus("PAID");
        } else if ("CASH".equals(rental.getPaymentMethod())) {
            rental.setPaymentStatus("UNPAID");
        }
        rental.setRentalStatus("CONFIRMED");
        rentalRepository.save(rental);

        rentalRepository.findUserEmailByRentalId(id).ifPresent(email -> businessMailNotificationSender.sendHtmlToUser(
                email,
                "[Rent-A-Car] Đơn thuê đã được xác nhận",
                BusinessMailNotificationSender.simpleHtmlEmail(
                        "Đơn thuê xe #" + id,
                        "Đơn thuê của bạn đã được admin xác nhận.\nTừ ngày: " + rental.getStartDate()
                                + "\nĐến ngày: " + rental.getEndDate()
                                + "\nTổng tiền: " + String.format("%,.0f", rental.getTotalPrice()) + " VNĐ."
                )
        ));

        return new SuccessResult("Admin đã xác nhận đơn thuê.");
    }

    @Override
    @Transactional
    public Result returnCarByUser(int rentalId, int userId, UserReturnCarRequest body) {
        Rental rental = rentalRepository.findById(rentalId).orElseThrow(
                () -> new NotFoundException(messageService.getMessage(Messages.Rental.getRentalNotFoundMessage)));

        if (rental.getUser() == null || rental.getUser().getId() != userId) {
            throw new BusinessException("Bạn không có quyền xác nhận trả xe cho đơn này.");
        }
        if (rental.getReturnDate() != null) {
            throw new BusinessException("Đơn đã được ghi nhận trả xe.");
        }
        String rs = normRentalToken(rental.getRentalStatus());
        if ("CANCELLED".equals(rs)) {
            throw new BusinessException("Đơn đã hủy, không thể trả xe.");
        }
        if (!"CONFIRMED".equals(rs)) {
            throw new BusinessException(
                    "Chỉ có thể trả xe khi đơn đã được admin xác nhận (đang thuê). Trạng thái hiện tại: "
                            + (rs.isBlank() ? "—" : rs) + ".");
        }
        if (body.getEndKilometer() == null) {
            throw new BusinessException("Vui lòng nhập số km đồng hồ khi trả xe.");
        }
        long endKm = body.getEndKilometer();
        long startKm = rental.getStartKilometer() != null ? rental.getStartKilometer() : 0L;
        if (endKm < startKm) {
            throw new BusinessException("Số km trả xe phải lớn hơn hoặc bằng km lúc nhận xe (" + startKm + " km).");
        }

        LocalDate returnDate = body.getReturnDate() != null ? body.getReturnDate() : LocalDate.now();
        if (returnDate.isBefore(rental.getStartDate())) {
            throw new BusinessException("Ngày trả xe không được trước ngày bắt đầu thuê.");
        }

        rental.setReturnDate(returnDate);
        rental.setEndKilometer(endKm);
        rental.setRentalStatus("COMPLETED");
        rentalRepository.save(rental);

        return new SuccessResult("Đã xác nhận trả xe. Cảm ơn bạn đã sử dụng dịch vụ AutoHub!");
    }

}

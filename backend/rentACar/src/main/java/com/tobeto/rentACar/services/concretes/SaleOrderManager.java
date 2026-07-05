package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.services.BusinessMailNotificationSender;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.SaleOrder;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.ReviewRepository;
import com.tobeto.rentACar.repositories.SaleOrderRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.services.abstracts.InvoiceService;
import com.tobeto.rentACar.services.abstracts.SaleOrderService;
import com.tobeto.rentACar.services.constants.ListingConstants;
import com.tobeto.rentACar.services.constants.Messages;
import com.tobeto.rentACar.services.dtos.invoice.request.AddInvoiceRequest;
import com.tobeto.rentACar.services.dtos.saleorder.request.AddSaleOrderRequest;
import com.tobeto.rentACar.services.dtos.saleorder.response.AddSaleOrderResponse;
import com.tobeto.rentACar.services.dtos.saleorder.response.GetAllSaleOrdersResponse;
import com.tobeto.rentACar.services.rules.RentalBusinessRule;
import com.tobeto.rentACar.services.rules.SaleBusinessRule;
import lombok.AllArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SaleOrderManager implements SaleOrderService {

    private final SaleOrderRepository saleOrderRepository;
    private final CarRepository carRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ModelMapperService modelMapperService;
    private final InvoiceService invoiceService;
    private final SaleBusinessRule saleBusinessRule;
    private final RentalBusinessRule rentalBusinessRule;
    private final BusinessMailNotificationSender businessMailNotificationSender;
    private final com.tobeto.rentACar.services.abstracts.PromotionService promotionService;
    private MessageService messageService;

    @Override
    @Transactional
    public AddSaleOrderResponse add(AddSaleOrderRequest request, int userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(messageService.getMessage(Messages.User.getUserNotFoundMessage));
        }
        rentalBusinessRule.checkUserKycApproved(userId);

        // BUGFIX #4: pessimistic lock tránh race condition khi 2 user cùng mua 1 xe cùng lúc.
        // assertNoOpenSaleOrderForCar + setSaleStatus phải atomic.
        Car car = carRepository.findByIdForUpdate(request.getCarId()).orElseThrow(
                () -> new BusinessException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));

        saleBusinessRule.assertCarReadyToSell(car);
        saleBusinessRule.assertNoOpenSaleOrderForCar(car.getId());

        double listPrice = car.getSalePrice();

        // Áp dụng mã khuyến mãi (nếu có) trước khi snapshot giá vào đơn (UC Mua xe — discount).
        var promoApply = promotionService.applyForUse(request.getPromotionCode(), "SALE", listPrice);
        double discount = promoApply.discountAmount();
        double total = Math.max(0, listPrice - discount);

        SaleOrder order = SaleOrder.builder()
                .car(carRepository.getReferenceById(car.getId()))
                .user(userRepository.getReferenceById(userId))
                .totalPrice(total)
                .paymentMethod(request.getPaymentMethod())
                .promotionCode(promoApply.code())
                .discountAmount(discount > 0 ? discount : null)
                .build();

        if ("BANK_TRANSFER".equals(request.getPaymentMethod())) {
            order.setPaymentStatus("PENDING_TRANSFER");
            order.setOrderStatus(ListingConstants.SALE_ORDER_PENDING_PAYMENT);
        } else {
            order.setPaymentStatus("UNPAID");
            order.setOrderStatus(ListingConstants.SALE_ORDER_PENDING_ADMIN);
        }

        SaleOrder saved = saleOrderRepository.save(order);

        // Optimistic lock: chuyển AVAILABLE → RESERVED. Nếu tab khác đã chiếm → ném 409 (xử lý ở controller).
        // OptimisticLockingFailureException là cha của ObjectOptimisticLockingFailureException — bắt 1 cái là đủ.
        car.setSaleStatus(ListingConstants.SALE_RESERVED);
        try {
            carRepository.save(car);
        } catch (OptimisticLockingFailureException e) {
            throw new BusinessException(
                    "Xe vừa được khách hàng khác đặt mua. Vui lòng quay lại trang chọn xe và thử lại.");
        }

        AddInvoiceRequest inv = new AddInvoiceRequest();
        inv.setInvoiceNo("INV-S" + saved.getId() + "-" + System.currentTimeMillis());
        inv.setTotalPrice((float) total);
        inv.setDiscountRate(listPrice > 0 ? (float) (discount / listPrice * 100d) : 0f);
        inv.setTaxRate(10f);
        inv.setRentalId(null);
        inv.setSaleOrderId(saved.getId());
        invoiceService.add(inv);

        if (promoApply.code() != null) {
            promotionService.consume(promoApply.code());
        }

        // Email xác nhận đã đặt mua (UC Mua xe).
        userRepository.findById(userId).map(u -> u.getEmail()).ifPresent(email -> businessMailNotificationSender.sendHtmlToUser(
                email,
                "[AutoHub] Đã ghi nhận đơn mua xe #" + saved.getId(),
                BusinessMailNotificationSender.simpleHtmlEmail(
                        "Đơn mua #" + saved.getId(),
                        "Cảm ơn bạn đã đặt mua xe trên AutoHub.\n"
                                + "Tổng tiền (sau giảm giá): " + String.format("%,.0f", total) + " VNĐ.\n"
                                + (discount > 0 ? "Giảm giá: -" + String.format("%,.0f", discount) + " VNĐ ("
                                        + (promoApply.code() != null ? promoApply.code() : "") + ").\n" : "")
                                + "Phương thức thanh toán: " + request.getPaymentMethod() + ".\n"
                                + "Theo dõi trạng thái đơn tại trang Đơn mua của tôi."
                )
        ));

        AddSaleOrderResponse res = new AddSaleOrderResponse();
        res.setId(saved.getId());
        res.setResult(new SuccessResult("Đặt mua xe thành công."));
        return res;
    }

    /** ModelMapper LOOSE có thể map {@code id} → {@code hasReview} (Boolean) → MappingException → 401. */
    private GetAllSaleOrdersResponse toSaleOrderDto(SaleOrder o) {
        var mapper = modelMapperService.forResponse();
        if (mapper.getTypeMap(SaleOrder.class, GetAllSaleOrdersResponse.class) == null) {
            mapper.createTypeMap(SaleOrder.class, GetAllSaleOrdersResponse.class)
                    .addMappings(m -> m.skip(GetAllSaleOrdersResponse::setHasReview));
        }
        GetAllSaleOrdersResponse dto = mapper.map(o, GetAllSaleOrdersResponse.class);
        dto.setCreatedDate(o.getCreatedDate());
        dto.setHasReview(reviewRepository.existsBySaleOrder_Id(o.getId()));
        return dto;
    }

    @Override
    public List<GetAllSaleOrdersResponse> getAll() {
        return saleOrderRepository.findAll().stream()
                .map(this::toSaleOrderDto)
                .toList();
    }

    @Override
    public GetAllSaleOrdersResponse getById(int id, int actorUserId, boolean isAdmin) {
        SaleOrder o = saleOrderRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Không tìm thấy đơn mua."));
        if (!isAdmin && (o.getUser() == null || o.getUser().getId() != actorUserId)) {
            throw new BusinessException("Bạn không có quyền xem đơn mua này.");
        }
        return toSaleOrderDto(o);
    }

    @Override
    public List<GetAllSaleOrdersResponse> getByUserId(int userId) {
        return saleOrderRepository.findByUser_IdOrderByIdDesc(userId).stream()
                .map(o -> {
                    GetAllSaleOrdersResponse dto = toSaleOrderDto(o);
                    dto.setHasReview(reviewRepository.existsBySaleOrder_Id(o.getId()));
                    return dto;
                })
                .toList();
    }

    @Override
    public Result submitTransfer(int id, int userId) {
        SaleOrder order = saleOrderRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Không tìm thấy đơn mua."));
        if (ListingConstants.SALE_ORDER_CANCELLED.equals(order.getOrderStatus())) {
            throw new BusinessException("Đơn mua đã bị hủy.");
        }
        if (order.getUser() == null || order.getUser().getId() != userId) {
            throw new BusinessException("Bạn không có quyền cập nhật đơn này.");
        }
        if (!"BANK_TRANSFER".equals(order.getPaymentMethod())) {
            throw new BusinessException("Đơn không dùng chuyển khoản.");
        }
        if (!ListingConstants.SALE_ORDER_PENDING_PAYMENT.equals(order.getOrderStatus())) {
            throw new BusinessException("Đơn không ở trạng thái chờ thanh toán.");
        }
        order.setPaymentStatus("PENDING_CONFIRM");
        order.setOrderStatus(ListingConstants.SALE_ORDER_PENDING_ADMIN);
        saleOrderRepository.save(order);
        return new SuccessResult("Đã gửi xác nhận chuyển khoản. Vui lòng chờ admin.");
    }

    @Override
    public Result confirmByAdmin(int id) {
        SaleOrder order = saleOrderRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Không tìm thấy đơn mua."));
        if (ListingConstants.SALE_ORDER_CANCELLED.equals(order.getOrderStatus())) {
            throw new BusinessException("Đơn đã hủy.");
        }
        if (ListingConstants.SALE_ORDER_COMPLETED.equals(order.getOrderStatus())) {
            throw new BusinessException("Đơn đã hoàn tất.");
        }
        if ("BANK_TRANSFER".equals(order.getPaymentMethod())) {
            if (!"PENDING_CONFIRM".equals(order.getPaymentStatus())) {
                throw new BusinessException("Khách chưa gửi xác nhận chuyển khoản.");
            }
            order.setPaymentStatus("PAID");
        } else if ("CASH".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("UNPAID");
        }
        order.setOrderStatus(ListingConstants.SALE_ORDER_COMPLETED);
        saleOrderRepository.save(order);

        Car car = carRepository.findById(order.getCar().getId()).orElseThrow();
        car.setSaleStatus(ListingConstants.SALE_SOLD);
        carRepository.save(car);

        saleOrderRepository.findUserEmailBySaleOrderId(id).ifPresent(email -> businessMailNotificationSender.sendHtmlToUser(
                email,
                "[Rent-A-Car] Đơn mua xe hoàn tất",
                BusinessMailNotificationSender.simpleHtmlEmail(
                        "Đơn mua #" + id,
                        "Giao dịch mua xe đã được admin xác nhận.\nTổng tiền: "
                                + String.format("%,.0f", order.getTotalPrice()) + " VNĐ."
                )
        ));

        return new SuccessResult("Admin đã xác nhận — giao dịch mua hoàn tất, xe đã bán.");
    }

    @Override
    public Result cancel(int id, int actorUserId, boolean isAdmin, String reason) {
        SaleOrder order = saleOrderRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Không tìm thấy đơn mua."));
        if (ListingConstants.SALE_ORDER_CANCELLED.equals(order.getOrderStatus())) {
            throw new BusinessException("Đơn đã hủy.");
        }
        if (ListingConstants.SALE_ORDER_COMPLETED.equals(order.getOrderStatus())) {
            throw new BusinessException("Không thể hủy đơn đã hoàn tất.");
        }
        if (!isAdmin && (order.getUser() == null || order.getUser().getId() != actorUserId)) {
            throw new BusinessException("Bạn không có quyền hủy đơn này.");
        }

        // BUGFIX #16: Check trạng thái xe TRƯỚC khi thay đổi DB, tránh inconsistent state
        // nếu throw exception giữa chừng (race với admin confirm đồng thời).
        Car car = carRepository.findById(order.getCar().getId()).orElseThrow();
        if (ListingConstants.SALE_SOLD.equalsIgnoreCase(car.getSaleStatus())) {
            throw new BusinessException("Trạng thái xe không cho phép hủy đơn.");
        }

        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledBy(isAdmin ? "ADMIN" : "USER");
        order.setCancellationReason(reason);
        order.setOrderStatus(ListingConstants.SALE_ORDER_CANCELLED);
        order.setPaymentStatus("CANCELLED");
        saleOrderRepository.save(order);

        car.setSaleStatus(ListingConstants.SALE_AVAILABLE);
        carRepository.save(car);

        int oid = order.getId();
        saleOrderRepository.findUserEmailBySaleOrderId(oid).ifPresent(email -> businessMailNotificationSender.sendHtmlToUser(
                email,
                "[Rent-A-Car] Đơn mua đã hủy",
                BusinessMailNotificationSender.simpleHtmlEmail(
                        "Đơn mua #" + oid + " đã hủy",
                        "Đơn mua đã được hủy (" + order.getCancelledBy() + ").\nLý do: "
                                + (reason != null && !reason.isBlank() ? reason : "(không có)")
                )
        ));

        return new SuccessResult("Đã hủy đơn mua. Xe được mở bán lại.");
    }
}

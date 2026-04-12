package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.exceptions.types.NotFoundException;
import com.tobeto.rentACar.core.utilities.messages.MessageService;
import com.tobeto.rentACar.core.utilities.mappers.ModelMapperService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.SaleOrder;
import com.tobeto.rentACar.repositories.CarRepository;
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
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SaleOrderManager implements SaleOrderService {

    private final SaleOrderRepository saleOrderRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final ModelMapperService modelMapperService;
    private final InvoiceService invoiceService;
    private final RentalBusinessRule rentalBusinessRule;
    private final SaleBusinessRule saleBusinessRule;
    private MessageService messageService;

    @Override
    public AddSaleOrderResponse add(AddSaleOrderRequest request, int userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(messageService.getMessage(Messages.User.getUserNotFoundMessage));
        }
        rentalBusinessRule.checkUserKycApproved(userId);

        Car car = carRepository.findById(request.getCarId()).orElseThrow(
                () -> new BusinessException(messageService.getMessage(Messages.Car.getCarNotFoundMessage)));

        saleBusinessRule.assertCarReadyToSell(car);
        saleBusinessRule.assertNoOpenSaleOrderForCar(car.getId());

        double total = car.getSalePrice();
        SaleOrder order = SaleOrder.builder()
                .car(carRepository.getReferenceById(car.getId()))
                .user(userRepository.getReferenceById(userId))
                .totalPrice(total)
                .paymentMethod(request.getPaymentMethod())
                .build();

        if ("BANK_TRANSFER".equals(request.getPaymentMethod())) {
            order.setPaymentStatus("PENDING_TRANSFER");
            order.setOrderStatus(ListingConstants.SALE_ORDER_PENDING_PAYMENT);
        } else {
            order.setPaymentStatus("UNPAID");
            order.setOrderStatus(ListingConstants.SALE_ORDER_PENDING_ADMIN);
        }

        SaleOrder saved = saleOrderRepository.save(order);

        car.setSaleStatus(ListingConstants.SALE_RESERVED);
        carRepository.save(car);

        AddInvoiceRequest inv = new AddInvoiceRequest();
        inv.setInvoiceNo("INV-S" + saved.getId() + "-" + System.currentTimeMillis());
        inv.setTotalPrice((float) total);
        inv.setDiscountRate(0f);
        inv.setTaxRate(10f);
        inv.setRentalId(null);
        inv.setSaleOrderId(saved.getId());
        invoiceService.add(inv);

        AddSaleOrderResponse res = new AddSaleOrderResponse();
        res.setId(saved.getId());
        res.setResult(new SuccessResult("Đặt mua xe thành công."));
        return res;
    }

    @Override
    public List<GetAllSaleOrdersResponse> getAll() {
        return saleOrderRepository.findAll().stream()
                .map(o -> modelMapperService.forResponse().map(o, GetAllSaleOrdersResponse.class))
                .toList();
    }

    @Override
    public GetAllSaleOrdersResponse getById(int id) {
        SaleOrder o = saleOrderRepository.findById(id).orElseThrow(
                () -> new NotFoundException("Không tìm thấy đơn mua."));
        return modelMapperService.forResponse().map(o, GetAllSaleOrdersResponse.class);
    }

    @Override
    public List<GetAllSaleOrdersResponse> getByUserId(int userId) {
        return saleOrderRepository.findByUser_IdOrderByIdDesc(userId).stream()
                .map(o -> modelMapperService.forResponse().map(o, GetAllSaleOrdersResponse.class))
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

        order.setCancelledAt(LocalDateTime.now());
        order.setCancelledBy(isAdmin ? "ADMIN" : "USER");
        order.setCancellationReason(reason);
        order.setOrderStatus(ListingConstants.SALE_ORDER_CANCELLED);
        order.setPaymentStatus("CANCELLED");
        saleOrderRepository.save(order);

        Car car = carRepository.findById(order.getCar().getId()).orElseThrow();
        if (ListingConstants.SALE_SOLD.equalsIgnoreCase(car.getSaleStatus())) {
            throw new BusinessException("Trạng thái xe không cho phép hủy đơn.");
        }
        car.setSaleStatus(ListingConstants.SALE_AVAILABLE);
        carRepository.save(car);

        return new SuccessResult("Đã hủy đơn mua. Xe được mở bán lại.");
    }
}

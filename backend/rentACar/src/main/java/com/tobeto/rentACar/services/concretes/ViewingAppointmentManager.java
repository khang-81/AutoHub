package com.tobeto.rentACar.services.concretes;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.core.utilities.results.SuccessResult;
import com.tobeto.rentACar.entities.concretes.Car;
import com.tobeto.rentACar.entities.concretes.ViewingAppointment;
import com.tobeto.rentACar.repositories.CarRepository;
import com.tobeto.rentACar.repositories.UserRepository;
import com.tobeto.rentACar.repositories.ViewingAppointmentRepository;
import com.tobeto.rentACar.services.abstracts.CarService;
import com.tobeto.rentACar.services.abstracts.ViewingAppointmentService;
import com.tobeto.rentACar.services.constants.ListingConstants;
import com.tobeto.rentACar.services.constants.ViewingAppointmentConstants;
import com.tobeto.rentACar.services.dtos.car.response.GetCarByIdResponse;
import com.tobeto.rentACar.services.dtos.user.response.GetUserByIdResponse;
import com.tobeto.rentACar.services.dtos.viewing.request.CreateViewingAppointmentRequest;
import com.tobeto.rentACar.services.dtos.viewing.request.UpdateViewingStatusRequest;
import com.tobeto.rentACar.services.dtos.viewing.response.ViewingAppointmentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ViewingAppointmentManager implements ViewingAppointmentService {

    private final ViewingAppointmentRepository viewingAppointmentRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final CarService carService;

    @Override
    @Transactional
    public ViewingAppointmentResponse create(CreateViewingAppointmentRequest request, int userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException("Không tìm thấy người dùng.");
        }
        Car car = carRepository.findById(request.getCarId()).orElseThrow(
                () -> new BusinessException("Không tìm thấy xe."));
        assertCarEligibleForViewing(car);
        validateSchedule(request.getScheduledAt());

        if (viewingAppointmentRepository.countByUser_IdAndCar_IdAndStatus(
                userId, car.getId(), ViewingAppointmentConstants.STATUS_PENDING) > 0) {
            throw new BusinessException("Bạn đã có lịch chờ duyệt cho xe này. Vui lòng hủy hoặc chờ xử lý.");
        }

        ViewingAppointment entity = ViewingAppointment.builder()
                .car(carRepository.getReferenceById(car.getId()))
                .user(userRepository.getReferenceById(userId))
                .scheduledAt(request.getScheduledAt())
                .status(ViewingAppointmentConstants.STATUS_PENDING)
                .note(trimToNull(request.getNote()))
                .contactPhone(trimToNull(request.getContactPhone()))
                .build();
        ViewingAppointment saved = viewingAppointmentRepository.save(entity);
        ViewingAppointment full = viewingAppointmentRepository.findByIdWithRelations(saved.getId())
                .orElseThrow(() -> new BusinessException("Không tải được lịch hẹn vừa tạo."));
        return mapEntity(full);
    }

    private static String trimToNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private void assertCarEligibleForViewing(Car car) {
        String lt = car.getListingType() != null ? car.getListingType().toUpperCase() : "";
        if (ListingConstants.LISTING_RENT_ONLY.equals(lt)) {
            if (car.getDailyPrice() == null || car.getDailyPrice() <= 0) {
                throw new BusinessException("Xe chưa có giá thuê hợp lệ — không thể đặt lịch xem.");
            }
            return;
        }
        if (!ListingConstants.LISTING_SALE_ONLY.equals(lt)) {
            throw new BusinessException("Xe này không hỗ trợ đặt lịch xem theo niêm yết hiện tại.");
        }
        String ss = car.getSaleStatus() != null ? car.getSaleStatus().toUpperCase() : "";
        if (ListingConstants.SALE_SOLD.equals(ss)) {
            throw new BusinessException("Xe đã bán — không thể đặt lịch xem.");
        }
        if (!ListingConstants.SALE_AVAILABLE.equals(ss) && !ListingConstants.SALE_RESERVED.equals(ss)) {
            throw new BusinessException("Xe chưa sẵn sàng để xem.");
        }
        if (car.getSalePrice() == null || car.getSalePrice() <= 0) {
            throw new BusinessException("Xe chưa có giá bán hợp lệ.");
        }
    }

    private void validateSchedule(LocalDateTime scheduledAt) {
        LocalDateTime now = LocalDateTime.now();
        if (scheduledAt.isBefore(now.plusHours(2))) {
            throw new BusinessException("Thời gian xem phải cách hiện tại ít nhất 2 giờ.");
        }
        if (scheduledAt.isAfter(now.plusDays(60))) {
            throw new BusinessException("Chỉ được đặt lịch trong vòng 60 ngày tới.");
        }
        DayOfWeek dow = scheduledAt.getDayOfWeek();
        if (dow == DayOfWeek.SUNDAY) {
            throw new BusinessException("Không nhận lịch xem xe vào Chủ nhật.");
        }
        int h = scheduledAt.getHour();
        if (h < 8 || h > 17) {
            throw new BusinessException("Giờ xem xe: 08:00 – 17:30 (trong tuần, trừ Chủ nhật).");
        }
        if (h == 17 && scheduledAt.getMinute() > 30) {
            throw new BusinessException("Khung giờ cuối trong ngày là 17:30.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ViewingAppointmentResponse> getMine(int userId) {
        return viewingAppointmentRepository.findByUserIdWithRelations(userId).stream()
                .map(this::mapEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Result cancelMine(int id, int userId) {
        ViewingAppointment v = viewingAppointmentRepository.findByIdWithRelations(id).orElseThrow(
                () -> new BusinessException("Không tìm thấy lịch hẹn."));
        if (v.getUser().getId() != userId) {
            throw new BusinessException("Không có quyền hủy lịch này.");
        }
        if (!ViewingAppointmentConstants.STATUS_PENDING.equals(v.getStatus())) {
            throw new BusinessException("Chỉ hủy được lịch đang chờ xác nhận.");
        }
        v.setStatus(ViewingAppointmentConstants.STATUS_CANCELLED);
        v.setAdminNote(null);
        viewingAppointmentRepository.save(v);
        return new SuccessResult("Đã hủy lịch hẹn.");
    }

    @Override
    @Transactional(readOnly = true)
    public List<ViewingAppointmentResponse> getAllForAdmin() {
        return viewingAppointmentRepository.findAllWithRelations().stream()
                .map(this::mapEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Result updateStatusByAdmin(int id, UpdateViewingStatusRequest request) {
        ViewingAppointment v = viewingAppointmentRepository.findByIdWithRelations(id).orElseThrow(
                () -> new BusinessException("Không tìm thấy lịch hẹn."));
        String next = request.getStatus();
        String cur = v.getStatus();
        if (ViewingAppointmentConstants.STATUS_CANCELLED.equals(cur)
                || ViewingAppointmentConstants.STATUS_COMPLETED.equals(cur)
                || ViewingAppointmentConstants.STATUS_NO_SHOW.equals(cur)) {
            throw new BusinessException("Lịch đã kết thúc, không đổi trạng thái.");
        }
        if (ViewingAppointmentConstants.STATUS_CONFIRMED.equals(next)) {
            if (!ViewingAppointmentConstants.STATUS_PENDING.equals(cur)) {
                throw new BusinessException("Chỉ xác nhận được lịch đang chờ.");
            }
            v.setStatus(ViewingAppointmentConstants.STATUS_CONFIRMED);
        } else if (ViewingAppointmentConstants.STATUS_CANCELLED.equals(next)) {
            v.setStatus(ViewingAppointmentConstants.STATUS_CANCELLED);
        } else if (ViewingAppointmentConstants.STATUS_COMPLETED.equals(next)) {
            if (!ViewingAppointmentConstants.STATUS_CONFIRMED.equals(cur)) {
                throw new BusinessException("Chỉ hoàn tất được lịch đã xác nhận.");
            }
            v.setStatus(ViewingAppointmentConstants.STATUS_COMPLETED);
        } else if (ViewingAppointmentConstants.STATUS_NO_SHOW.equals(next)) {
            if (!ViewingAppointmentConstants.STATUS_CONFIRMED.equals(cur)) {
                throw new BusinessException("Chỉ ghi nhận không đến khi lịch đã xác nhận.");
            }
            v.setStatus(ViewingAppointmentConstants.STATUS_NO_SHOW);
        }
        v.setAdminNote(trimToNull(request.getAdminNote()));
        viewingAppointmentRepository.save(v);
        return new SuccessResult("Đã cập nhật trạng thái lịch hẹn.");
    }

    private ViewingAppointmentResponse mapEntity(ViewingAppointment v) {
        GetCarByIdResponse carDto = carService.getById(v.getCar().getId());
        GetUserByIdResponse u = new GetUserByIdResponse();
        u.setId(v.getUser().getId());
        u.setEmail(v.getUser().getEmail());
        u.setKycStatus(v.getUser().getKycStatus());
        u.setPassword(null);
        ViewingAppointmentResponse r = new ViewingAppointmentResponse();
        r.setId(v.getId());
        r.setScheduledAt(v.getScheduledAt());
        r.setStatus(v.getStatus());
        r.setNote(v.getNote());
        r.setContactPhone(v.getContactPhone());
        r.setAdminNote(v.getAdminNote());
        r.setCreatedDate(v.getCreatedDate());
        r.setCar(carDto);
        r.setUser(u);
        return r;
    }
}

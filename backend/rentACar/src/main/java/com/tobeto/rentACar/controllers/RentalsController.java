package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.RentalService;
import com.tobeto.rentACar.services.dtos.rental.request.AddRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.CancelRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.DeleteRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.FindRentalIdRequest;
import com.tobeto.rentACar.services.dtos.rental.request.UpdateRentalRequest;
import com.tobeto.rentACar.services.dtos.rental.request.UserReturnCarRequest;
import com.tobeto.rentACar.services.dtos.rental.response.*;

import jakarta.servlet.http.HttpServletRequest;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("api/rentals")
@AllArgsConstructor
@CrossOrigin
public class RentalsController {

    private final RentalService rentalService;
    private final JwtService jwtService;

    @PostMapping("/add")
    public AddRentalResponse add(@RequestBody @Valid AddRentalRequest request, HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập để đặt xe.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        Integer tokenUserIdBoxed = jwtService.extractUserId(token);
        if (tokenUserIdBoxed == null) {
            throw new BusinessException("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        }
        int tokenUserId = tokenUserIdBoxed;
        // Luôn gắn đơn với user trong JWT (tránh lệch userId từ client cache / persist).
        request.setUserId(tokenUserId);
        return rentalService.add(request);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/update")
    public Result update(@RequestBody @Valid UpdateRentalRequest request){
        return rentalService.update(request);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete")
    public  Result delete(@RequestBody @Valid DeleteRentalRequest request){
        return rentalService.delete(request);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/getAll")
    public List<GetAllRentalsResponse> getAll(){
        return rentalService.getAll();
    }

    /** Dữ liệu tối thiểu cho lịch đặt xe (trang công khai). */
    @GetMapping("/public/busy-ranges/{carId}")
    public List<RentalBusyRangeResponse> getPublicBusyRanges(@PathVariable int carId) {
        return rentalService.getPublicBusyRangesForCar(carId);
    }

    @GetMapping("/getById/{id}")
    public GetRentalByIdResponse getById(@PathVariable int id, HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_admin".equals(a.getAuthority()) || "admin".equals(a.getAuthority()));
        return rentalService.getById(id, userId, isAdmin);
    }


    @GetMapping("/getRentalId")
    public GetRentalIdResponse getRentalId(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String endDate,
            @RequestParam("carId") int carId,
            @RequestParam("userId") int userId,
            HttpServletRequest httpRequest) {

        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int tokenUserId = jwtService.extractUserId(token);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_admin".equals(a.getAuthority()) || "admin".equals(a.getAuthority()));
        if (!isAdmin && tokenUserId != userId) {
            throw new BusinessException("Bạn không có quyền tra cứu đơn thuê này.");
        }

        LocalDate parsedStartDate = LocalDate.parse(startDate.substring(0, 10));
        LocalDate parsedEndDate = LocalDate.parse(endDate.substring(0, 10));

        FindRentalIdRequest request = new FindRentalIdRequest(parsedStartDate, parsedEndDate, carId, userId);

        return rentalService.getRentalId(request);
    }


    @GetMapping("/getRentalsByUserId")
    public List<GetRentalByUserIdResponse> getRentals(HttpServletRequest request) {

        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userID = jwtService.extractUserId(token);

        return rentalService.getByUserId(userID);
    }

    /** Khách xác nhận đã trả xe (đơn đã CONFIRMED). */
    @PutMapping("/{id}/return")
    public Result returnCarByUser(
            @PathVariable int id,
            @RequestBody @Valid UserReturnCarRequest body,
            HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        return rentalService.returnCarByUser(id, userId, body);
    }

    @PutMapping("/submitTransfer/{id}")
    public Result submitTransfer(@PathVariable int id, HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userID = jwtService.extractUserId(token);
        return rentalService.submitTransfer(id, userID);
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/confirm/{id}")
    public Result confirmByAdmin(@PathVariable int id) {
        return rentalService.confirmByAdmin(id);
    }

    @GetMapping("/insurance-options")
    public List<InsuranceOptionResponse> insuranceOptions() {
        return List.of(
                new InsuranceOptionResponse("NONE", "Không mua thêm", 0),
                new InsuranceOptionResponse("BASIC", "Gói cơ bản", 80_000),
                new InsuranceOptionResponse("STANDARD", "Gói tiêu chuẩn", 120_000),
                new InsuranceOptionResponse("PREMIUM", "Gói cao cấp", 180_000)
        );
    }

    @PutMapping("/cancel/{id}")
    public Result cancel(
            @PathVariable int id,
            @RequestBody(required = false) CancelRentalRequest body,
            HttpServletRequest request) {
        String tokenWithPrefix = request.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        int userId = jwtService.extractUserId(token);
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> "ROLE_admin".equals(a.getAuthority()) || "admin".equals(a.getAuthority()));
        String reason = body != null ? body.getReason() : null;
        return rentalService.cancel(id, userId, isAdmin, reason);
    }

}

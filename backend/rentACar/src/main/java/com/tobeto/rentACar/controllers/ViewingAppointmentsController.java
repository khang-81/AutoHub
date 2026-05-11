package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.exceptions.types.BusinessException;
import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.abstracts.ViewingAppointmentService;
import com.tobeto.rentACar.services.dtos.viewing.request.CreateViewingAppointmentRequest;
import com.tobeto.rentACar.services.dtos.viewing.request.RescheduleViewingRequest;
import com.tobeto.rentACar.services.dtos.viewing.request.UpdateViewingStatusRequest;
import com.tobeto.rentACar.services.dtos.viewing.response.SlotAvailabilityResponse;
import com.tobeto.rentACar.services.dtos.viewing.response.ViewingAppointmentResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("api/viewing-appointments")
@AllArgsConstructor
@CrossOrigin
public class ViewingAppointmentsController {

    private final ViewingAppointmentService viewingAppointmentService;
    private final JwtService jwtService;

    private int extractUserId(HttpServletRequest httpRequest) {
        String tokenWithPrefix = httpRequest.getHeader("Authorization");
        if (tokenWithPrefix == null || !tokenWithPrefix.startsWith("Bearer ")) {
            throw new BusinessException("Yêu cầu đăng nhập.");
        }
        String token = tokenWithPrefix.replace("Bearer ", "");
        return jwtService.extractUserId(token);
    }

    @PostMapping
    public ViewingAppointmentResponse create(
            @RequestBody @Valid CreateViewingAppointmentRequest request,
            HttpServletRequest httpRequest) {
        int userId = extractUserId(httpRequest);
        return viewingAppointmentService.create(request, userId);
    }

    @GetMapping("/my")
    public List<ViewingAppointmentResponse> getMine(HttpServletRequest httpRequest) {
        int userId = extractUserId(httpRequest);
        return viewingAppointmentService.getMine(userId);
    }

    @PutMapping("/{id}/cancel")
    public Result cancelMine(@PathVariable int id, HttpServletRequest httpRequest) {
        int userId = extractUserId(httpRequest);
        return viewingAppointmentService.cancelMine(id, userId);
    }

    @PutMapping("/{id}/reschedule")
    public Result rescheduleMine(@PathVariable int id,
                                 @RequestBody @Valid RescheduleViewingRequest request,
                                 HttpServletRequest httpRequest) {
        int userId = extractUserId(httpRequest);
        return viewingAppointmentService.rescheduleMine(id, userId, request);
    }

    @GetMapping("/availability")
    public List<SlotAvailabilityResponse> getAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return viewingAppointmentService.getAvailability(date);
    }

    @PreAuthorize("hasRole('admin')")
    @GetMapping("/all")
    public List<ViewingAppointmentResponse> getAllForAdmin() {
        return viewingAppointmentService.getAllForAdmin();
    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}/status")
    public Result updateStatusByAdmin(
            @PathVariable int id,
            @RequestBody @Valid UpdateViewingStatusRequest request) {
        return viewingAppointmentService.updateStatusByAdmin(id, request);
    }
}

package com.tobeto.rentACar.services.abstracts;

import com.tobeto.rentACar.core.utilities.results.Result;
import com.tobeto.rentACar.services.dtos.viewing.request.CreateViewingAppointmentRequest;
import com.tobeto.rentACar.services.dtos.viewing.request.RescheduleViewingRequest;
import com.tobeto.rentACar.services.dtos.viewing.request.UpdateViewingStatusRequest;
import com.tobeto.rentACar.services.dtos.viewing.response.SlotAvailabilityResponse;
import com.tobeto.rentACar.services.dtos.viewing.response.ViewingAppointmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface ViewingAppointmentService {

    ViewingAppointmentResponse create(CreateViewingAppointmentRequest request, int userId);

    List<ViewingAppointmentResponse> getMine(int userId);

    Result cancelMine(int id, int userId);

    Result rescheduleMine(int id, int userId, RescheduleViewingRequest request);

    List<ViewingAppointmentResponse> getAllForAdmin();

    Result updateStatusByAdmin(int id, UpdateViewingStatusRequest request);

    List<SlotAvailabilityResponse> getAvailability(LocalDate date);
}

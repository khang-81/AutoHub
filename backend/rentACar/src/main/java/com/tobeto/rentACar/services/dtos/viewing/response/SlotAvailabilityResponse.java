package com.tobeto.rentACar.services.dtos.viewing.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SlotAvailabilityResponse {

    private LocalTime startTime;
    private int booked;
    private int maxPerSlot;
    private boolean available;
}

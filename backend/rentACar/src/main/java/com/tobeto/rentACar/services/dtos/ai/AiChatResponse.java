package com.tobeto.rentACar.services.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatResponse {
    private boolean success;
    private String message;
    private String model;
}

package com.tobeto.rentACar.services.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatMessage {
    private String role;
    private String content;
}

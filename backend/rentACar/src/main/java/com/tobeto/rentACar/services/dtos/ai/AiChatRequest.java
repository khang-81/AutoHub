package com.tobeto.rentACar.services.dtos.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiChatRequest {
    private String message;
    private List<AiChatMessage> history;
    private String systemPrompt;
}

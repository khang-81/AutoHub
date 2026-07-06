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
    /** Token usage from Arcanic/OpenAI-compatible `usage` (null if unavailable). */
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
}

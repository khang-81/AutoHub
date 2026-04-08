package com.tobeto.rentACar.core.services;

import com.tobeto.rentACar.services.dtos.ai.AiChatRequest;
import com.tobeto.rentACar.services.dtos.ai.AiChatResponse;

public interface AiChatService {
    AiChatResponse chat(AiChatRequest request);
}

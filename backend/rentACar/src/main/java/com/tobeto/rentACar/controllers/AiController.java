package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.services.AiChatService;
import com.tobeto.rentACar.services.dtos.ai.AiChatRequest;
import com.tobeto.rentACar.services.dtos.ai.AiChatResponse;
import com.tobeto.rentACar.services.dtos.ai.AiStatusResponse;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/ai")
@AllArgsConstructor
@CrossOrigin
public class AiController {

    private final AiChatService aiChatService;

    @GetMapping("/status")
    public AiStatusResponse status() {
        return new AiStatusResponse(aiChatService.isGeminiConfigured());
    }

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {
        return aiChatService.chat(request);
    }
}

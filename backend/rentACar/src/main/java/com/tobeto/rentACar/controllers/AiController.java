package com.tobeto.rentACar.controllers;

import com.tobeto.rentACar.core.services.AiChatService;
import com.tobeto.rentACar.services.dtos.ai.AiChatRequest;
import com.tobeto.rentACar.services.dtos.ai.AiChatResponse;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/ai")
@AllArgsConstructor
@CrossOrigin
public class AiController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public AiChatResponse chat(@RequestBody AiChatRequest request) {
        return aiChatService.chat(request);
    }
}

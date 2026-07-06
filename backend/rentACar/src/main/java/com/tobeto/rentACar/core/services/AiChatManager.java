package com.tobeto.rentACar.core.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tobeto.rentACar.services.dtos.ai.AiChatMessage;
import com.tobeto.rentACar.services.dtos.ai.AiChatRequest;
import com.tobeto.rentACar.services.dtos.ai.AiChatResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiChatManager implements AiChatService {

    @Value("${arcanic.api.key:}")
    private String apiKey;

    @Value("${arcanic.api.base-url:https://api.arcanic.ai/v1}")
    private String baseUrl;

    @Value("${arcanic.api.model:cono-3}")
    private String model;

    @Value("${arcanic.api.chat-max-tokens:500}")
    private int chatMaxTokens;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiChatManager(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(12)).build();
    }

    @Override
    public boolean isAiConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        if (!isAiConfigured()) {
            return new AiChatResponse(false, "Arcanic API key is missing on server", null, null, null, null);
        }

        String prompt = request.getMessage() == null ? "" : request.getMessage().trim();
        if (prompt.isBlank()) {
            return new AiChatResponse(false, "Message is required", null, null, null, null);
        }

        try {
            ArcanicResult result = callArcanic(request);
            if (result.text() != null && !result.text().isBlank()) {
                return new AiChatResponse(
                        true,
                        result.text().trim(),
                        model,
                        result.promptTokens(),
                        result.completionTokens(),
                        result.totalTokens());
            }
            return new AiChatResponse(false, "Arcanic returned empty response", null, null, null, null);
        } catch (Exception e) {
            String msg = e.getMessage() == null ? "Unknown error" : e.getMessage();
            if (msg.contains("HTTP 429")) {
                return new AiChatResponse(false,
                        "Arcanic quota/rate limit exceeded (HTTP 429). Please wait or upgrade billing.",
                        null, null, null, null);
            }
            return new AiChatResponse(false, msg, null, null, null, null);
        }
    }

    private record ArcanicResult(String text, Integer promptTokens, Integer completionTokens, Integer totalTokens) {}

    private ArcanicResult callArcanic(AiChatRequest request) throws IOException, InterruptedException {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", toMessages(request));
        payload.put("max_tokens", chatMaxTokens);
        payload.put("temperature", 0.6);

        String body = objectMapper.writeValueAsString(payload);
        String url = String.format("%s/chat/completions", baseUrl);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Arcanic HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode textNode = root.path("choices").path(0).path("message").path("content");
        if (textNode.isMissingNode() || textNode.isNull()) {
            return new ArcanicResult(null, null, null, null);
        }

        JsonNode usage = root.path("usage");
        Integer promptTokens = intOrNull(usage, "prompt_tokens");
        Integer completionTokens = intOrNull(usage, "completion_tokens");
        Integer totalTokens = intOrNull(usage, "total_tokens");
        return new ArcanicResult(textNode.asText(), promptTokens, completionTokens, totalTokens);
    }

    private static Integer intOrNull(JsonNode node, String field) {
        JsonNode v = node.path(field);
        if (v.isMissingNode() || v.isNull() || !v.isNumber()) {
            return null;
        }
        return v.asInt();
    }

    private List<Map<String, Object>> toMessages(AiChatRequest request) {
        List<Map<String, Object>> messages = new ArrayList<>();

        String systemPrompt = request.getSystemPrompt();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            Map<String, Object> sys = new HashMap<>();
            sys.put("role", "system");
            sys.put("content", systemPrompt);
            messages.add(sys);
        }

        if (request.getHistory() != null) {
            for (AiChatMessage msg : request.getHistory()) {
                if (msg == null || msg.getContent() == null || msg.getContent().isBlank()) continue;
                String role;
                if ("model".equalsIgnoreCase(msg.getRole()) || "assistant".equalsIgnoreCase(msg.getRole())) {
                    role = "assistant";
                } else {
                    role = "user";
                }
                Map<String, Object> m = new HashMap<>();
                m.put("role", role);
                m.put("content", msg.getContent());
                messages.add(m);
            }
        }

        Map<String, Object> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", request.getMessage());
        messages.add(userMsg);

        return messages;
    }
}

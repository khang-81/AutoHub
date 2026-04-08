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

    private static final List<String> MODEL_CANDIDATES = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite"
    );

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.base-url:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public AiChatManager(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(12)).build();
    }

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return new AiChatResponse(false, "Gemini API key is missing on server", null);
        }

        String prompt = request.getMessage() == null ? "" : request.getMessage().trim();
        if (prompt.isBlank()) {
            return new AiChatResponse(false, "Message is required", null);
        }

        List<String> errors = new ArrayList<>();
        boolean hasQuotaError = false;
        for (String model : MODEL_CANDIDATES) {
            try {
                String text = callGemini(model, request);
                if (text != null && !text.isBlank()) {
                    return new AiChatResponse(true, text.trim(), model);
                }
            } catch (Exception e) {
                String msg = e.getMessage() == null ? "Unknown error" : e.getMessage();
                errors.add(model + ": " + msg);
                if (msg.contains("HTTP 429")) {
                    hasQuotaError = true;
                }
            }
        }

        String err;
        if (hasQuotaError) {
            err = "Gemini quota exceeded (HTTP 429). Please wait or upgrade billing.";
        } else if (!errors.isEmpty()) {
            err = errors.get(errors.size() - 1);
        } else {
            err = "Unknown Gemini error";
        }
        return new AiChatResponse(false, err, null);
    }

    private String callGemini(String model, AiChatRequest request) throws IOException, InterruptedException {
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", toContents(request));

        String body = objectMapper.writeValueAsString(payload);
        String url = String.format("%s/v1beta/models/%s:generateContent?key=%s", baseUrl, model, apiKey);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(25))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Gemini HTTP " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.isNull()) {
            return null;
        }
        return textNode.asText();
    }

    private List<Map<String, Object>> toContents(AiChatRequest request) {
        List<Map<String, Object>> contents = new ArrayList<>();

        String systemPrompt = request.getSystemPrompt();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            contents.add(toPart("user", systemPrompt));
            contents.add(toPart("model", "Tôi đã hiểu hướng dẫn và sẽ trả lời đúng vai trò."));
        }

        if (request.getHistory() != null) {
            for (AiChatMessage msg : request.getHistory()) {
                if (msg == null || msg.getContent() == null || msg.getContent().isBlank()) continue;
                String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
                contents.add(toPart(role, msg.getContent()));
            }
        }

        contents.add(toPart("user", request.getMessage()));
        return contents;
    }

    private Map<String, Object> toPart(String role, String text) {
        Map<String, Object> part = new HashMap<>();
        part.put("text", text);

        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(part);

        Map<String, Object> item = new HashMap<>();
        item.put("role", role);
        item.put("parts", parts);
        return item;
    }
}

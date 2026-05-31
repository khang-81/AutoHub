package com.tobeto.rentACar.core.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * In-memory rate limiter for sensitive public endpoints.
 * - /api/auth/** — 10 req / IP / 60s
 * - /api/ai/** — 30 req / IP / 60s
 * - /api/contact/** — 5 req / IP / 60s
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record LimitRule(int maxRequests, long windowMs) {}

    private static final LimitRule AUTH_LIMIT = new LimitRule(10, 60_000L);
    private static final LimitRule AI_LIMIT = new LimitRule(30, 60_000L);
    private static final LimitRule CONTACT_LIMIT = new LimitRule(5, 60_000L);

    private final Map<String, RateEntry> ipMap = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/api/auth/")
                && !path.startsWith("/api/ai/")
                && !path.startsWith("/api/contact/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        LimitRule rule = resolveRule(path);
        String ip = getClientIp(request);
        String key = ip + ":" + ruleKey(path);

        RateEntry entry = ipMap.compute(key, (k, v) -> {
            long now = System.currentTimeMillis();
            if (v == null || now - v.windowStart > rule.windowMs()) {
                return new RateEntry(now, new AtomicInteger(1));
            }
            v.count.incrementAndGet();
            return v;
        });

        if (entry.count.get() > rule.maxRequests()) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static LimitRule resolveRule(String path) {
        if (path.startsWith("/api/contact/")) {
            return CONTACT_LIMIT;
        }
        if (path.startsWith("/api/ai/")) {
            return AI_LIMIT;
        }
        return AUTH_LIMIT;
    }

    private static String ruleKey(String path) {
        if (path.startsWith("/api/contact/")) {
            return "contact";
        }
        if (path.startsWith("/api/ai/")) {
            return "ai";
        }
        return "auth";
    }

    private static String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateEntry {
        final long windowStart;
        final AtomicInteger count;

        RateEntry(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}

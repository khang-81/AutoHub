package com.tobeto.rentACar.core.configurations;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.util.Arrays;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebConfig.class);

    /** Dùng khi APP_CORS_ALLOWED_ORIGINS trống (tránh Spring CORS từ chối mọi origin → 403). */
    private static final String[] LOCAL_DEV_ORIGINS = {
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080"
    };

    @Value("${app.upload.root:uploads}")
    private String uploadRoot;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String corsAllowedOrigins;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path root = Path.of(uploadRoot).toAbsolutePath().normalize();
        String loc = root.toUri().toString();
        if (!loc.endsWith("/")) {
            loc = loc + "/";
        }
        registry.addResourceHandler("/files/**")
                .addResourceLocations(loc);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(corsAllowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        if (origins.length == 0) {
            log.warn("app.cors.allowed-origins is empty — using local dev defaults so API is reachable (fix APP_CORS_ALLOWED_ORIGINS in production).");
            origins = LOCAL_DEV_ORIGINS.clone();
        }
        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

}

package com.tobeto.rentACar.core.configurations;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Mức D: cache in-memory (Caffeine) cho dữ liệu tham chiếu đọc nhiều — giảm tải DB.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String BRANDS = "brands";
    public static final String COLORS = "colors";
    public static final String MODELS = "models";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(BRANDS, COLORS, MODELS);
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofMinutes(30))
                .maximumSize(2_000));
        return manager;
    }
}

package com.tobeto.rentACar.core.configurations;

import com.tobeto.rentACar.core.filters.JwtAuthFilter;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.core.GrantedAuthorityDefaults;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.core.Ordered;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@AllArgsConstructor
public class SecurityConfiguration {

    private final PasswordEncoder passwordEncoder;
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    /** Công khai: tài liệu API, đăng ký user, vai trò, thương hiệu, liên hệ, AI proxy, file KYC tĩnh. */
    private static final String[] PUBLIC_PREFIXES = {
            "/swagger-ui/**",
            "/v2/api-docs",
            "/v3/api-docs",
            "/v3/api-docs/**",
            "/api/users/**",
            "/api/roles/**",
            "/api/brands/**",
            "/api/contact/**",
            "/api/ai/**",
            "/files/**",
            "/actuator/**"
    };

    /** Actuator: chain riêng (không gắn JWT) — tránh 403 health khi deploy. */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public SecurityFilterChain actuatorSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/actuator/**")
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(x -> x.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain authEndpointsFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/auth/**")
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(x -> x.anyRequest().permitAll())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(x -> x
                        .requestMatchers(PUBLIC_PREFIXES).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cars/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rentals/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sale-orders/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/models/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/colors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/invoices/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customers/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/rentals/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/sale-orders/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customers/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/invoices/**").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setPasswordEncoder(passwordEncoder);
        provider.setUserDetailsService(userDetailsService);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public GrantedAuthorityDefaults grantedAuthorityDefaults() {
        return new GrantedAuthorityDefaults("");
    }
}

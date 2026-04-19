package com.tobeto.rentACar.core.filters;

import com.tobeto.rentACar.core.services.JwtService;
import com.tobeto.rentACar.services.abstracts.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@AllArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    /** Paths where JWT must not gate the request (preflight + public catalog/auth APIs). */
    private static final List<RequestMatcher> PUBLIC_API_MATCHERS = List.of(
            new AntPathRequestMatcher("/api/auth/**"),
            new AntPathRequestMatcher("/api/brands/**"),
            new AntPathRequestMatcher("/api/cars/**"),
            new AntPathRequestMatcher("/api/colors/**")
    );

    private final JwtService jwtService;
    private final UserService userService;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        for (RequestMatcher matcher : PUBLIC_API_MATCHERS) {
            if (matcher.matches(request)) {
                return true;
            }
        }
        return false;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String jwtHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (!StringUtils.hasText(jwtHeader) || !StringUtils.startsWithIgnoreCase(jwtHeader, "Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = jwtHeader.substring(7).trim();
        if (!StringUtils.hasText(jwt)) {
            rejectInvalidToken(response);
            return;
        }

        try {
            String username = jwtService.extractUser(jwt);
            if (!StringUtils.hasText(username)) {
                rejectInvalidToken(response);
                return;
            }

            UserDetails user = userService.loadUserByUsername(username);
            if (!jwtService.validateToken(jwt, user)) {
                rejectInvalidToken(response);
                return;
            }

            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            WebAuthenticationDetailsSource detailsSource = new WebAuthenticationDetailsSource();
            authenticationToken.setDetails(detailsSource.buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        } catch (Exception ex) {
            rejectInvalidToken(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private static void rejectInvalidToken(HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\"");
    }
}

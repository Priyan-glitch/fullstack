package in.edu.ssn.hostel.config;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import in.edu.ssn.hostel.service.CustomOAuth2UserService;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CustomOAuth2UserService customOAuth2UserService) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for OAuth2
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/api/user-info", "/error", "/favicon.ico",
                        "/styles.css", "/scripts/**", "/src/**").permitAll()
                .anyRequest().authenticated()
                )
                // API calls answer with 401 JSON instead of a 302 to the login page.
                // A redirect would be followed by fetch() and return the login page as
                // HTML with status 200, which the front end cannot tell apart from data.
                .exceptionHandling(ex -> ex.defaultAuthenticationEntryPointFor(
                        apiUnauthorizedEntryPoint(), new AntPathRequestMatcher("/api/**")))
                .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("/process", true)
                // Forward the real failure reason so the UI can say what went wrong
                // instead of always reporting a generic authentication failure.
                .failureHandler(oauthFailureHandler())
                )
                .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                );

        return http.build();
    }

    /** 401 + JSON for unauthenticated API calls, so the SPA can react to it. */
    @Bean
    public AuthenticationEntryPoint apiUnauthorizedEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                    "{\"message\":\"Your session has expired. Please sign in again.\"}");
        };
    }

    /** Redirect to the login page carrying the actual OAuth2 error code. */
    @Bean
    public AuthenticationFailureHandler oauthFailureHandler() {
        return (request, response, exception) -> {
            String code = "oauth_failed";
            if (exception instanceof OAuth2AuthenticationException oauthEx) {
                OAuth2Error error = oauthEx.getError();
                if (error != null && error.getErrorCode() != null && !error.getErrorCode().isBlank()) {
                    code = error.getErrorCode();
                }
            }
            response.sendRedirect("/login?error=" + URLEncoder.encode(code, StandardCharsets.UTF_8));
        };
    }

    @Bean
    public org.springframework.web.client.RestTemplate restTemplate() {
        return new org.springframework.web.client.RestTemplate();
    }
}

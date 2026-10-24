package in.edu.ssn.hostel.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    /** Single admin email — configured in application.properties (`app.admin.email`, env `ADMIN_EMAIL`). */
    private static final String ADMIN_EMAIL = "priyanrr2005@gmail.com";

    private static final String ALLOWED_DOMAIN = "@ssn.edu.in";

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User user = delegate.loadUser(request);

        String email = user.getAttribute("email");

        if (email == null) {
            throw new OAuth2AuthenticationException(new OAuth2Error("invalid_email"), "Access denied: Email is required.");
        }

        boolean isAdmin = email.trim().equalsIgnoreCase(ADMIN_EMAIL);
        String role = isAdmin ? "ADMIN" : "STUDENT";
        log.info("OAuth role assignment: email={}, role={}", email, role);

        Map<String, Object> attributes = new HashMap<>(user.getAttributes());
        attributes.put("role", role);

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "email"
        );
    }
}

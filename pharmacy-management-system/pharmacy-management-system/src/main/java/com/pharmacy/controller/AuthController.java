package com.pharmacy.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return Map.of("authenticated", false);
        }
        String role = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return Map.of(
            "authenticated", true,
            "username", authentication.getName(),
            "role", role
        );
    }
}

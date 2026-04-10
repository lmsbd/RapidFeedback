package com.unimelb.swen90017.rfo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Web configuration class
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.avatar-path:./uploads/avatars/}")
    private String avatarUploadPath;

    /**
     * CORS configuration
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Static resource mapping: expose uploaded avatars via /avatars/** URL.
     * Resolved relative to user.dir (project root: Backend/) to match UserServiceImpl.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        File uploadDir = new File(System.getProperty("user.dir"), avatarUploadPath);
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations(uploadDir.toURI().toString());
    }
}

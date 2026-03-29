package com.dlass.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves uploaded portfolio images as static resources under /uploads/**.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/provider}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Strip trailing "/provider" to get the parent "uploads/" folder
        Path uploadsRoot = Paths.get(uploadDir).toAbsolutePath().getParent();
        if (uploadsRoot == null) {
            uploadsRoot = Paths.get("uploads").toAbsolutePath();
        }

        String location = uploadsRoot.toUri().toString();
        if (!location.endsWith("/")) location += "/";

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(3600);
    }
}

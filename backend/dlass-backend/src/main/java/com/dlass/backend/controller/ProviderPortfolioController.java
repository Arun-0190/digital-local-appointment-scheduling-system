package com.dlass.backend.controller;

import com.dlass.backend.service.PortfolioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
public class ProviderPortfolioController {

    private final PortfolioService portfolioService;

    public ProviderPortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    /**
     * POST /api/provider/upload-image
     * Upload a portfolio image (PROVIDER role required).
     */
    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String filename = portfolioService.uploadImage(authentication.getName(), file);
            return ResponseEntity.ok(Map.of(
                    "filename", filename,
                    "url", "/uploads/provider/" + filename
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to save file."));
        }
    }

    /**
     * GET /api/provider/{id}/portfolio
     * Returns the list of image filenames for a provider (public).
     */
    @GetMapping("/{id}/portfolio")
    public ResponseEntity<List<String>> getPortfolio(@PathVariable String id) {
        return ResponseEntity.ok(portfolioService.getPortfolioImages(id));
    }

    /**
     * DELETE /api/provider/image/{imageName}
     * Delete a portfolio image (PROVIDER role required).
     */
    @DeleteMapping("/image/{imageName}")
    public ResponseEntity<Map<String, String>> deleteImage(
            @PathVariable String imageName,
            Authentication authentication) {
        try {
            portfolioService.deleteImage(authentication.getName(), imageName);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to delete file."));
        }
    }
}

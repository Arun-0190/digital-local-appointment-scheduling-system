package com.dlass.backend.service;

import com.dlass.backend.model.ServiceProvider;
import com.dlass.backend.repository.ServiceProviderRepository;
import com.dlass.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PortfolioService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final ServiceProviderRepository providerRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/provider}")
    private String uploadDir;

    public PortfolioService(ServiceProviderRepository providerRepository,
                            UserRepository userRepository) {
        this.providerRepository = providerRepository;
        this.userRepository = userRepository;
    }

    /** Upload an image, save it to disk, and record the filename in the provider document. */
    public String uploadImage(String email, MultipartFile file) throws IOException {
        // Validate size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds the 5 MB limit.");
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP, and GIF images are allowed.");
        }

        // Resolve provider
        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Build safe filename: uuid + original extension
        String originalFilename = file.getOriginalFilename();
        String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String filename = UUID.randomUUID().toString() + ext;

        // Ensure upload directory exists
        Path dir = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(dir);

        // Save file
        Path destination = dir.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        // Persist filename in provider document
        List<String> images = provider.getPortfolioImages();
        if (images == null) images = new ArrayList<>();
        images.add(filename);
        provider.setPortfolioImages(images);
        providerRepository.save(provider);

        return filename;
    }

    /** Returns the list of image filenames for a provider. */
    public List<String> getPortfolioImages(String providerId) {
        ServiceProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        List<String> images = provider.getPortfolioImages();
        return images != null ? images : List.of();
    }

    /** Delete a specific image from disk and from the provider document. */
    public void deleteImage(String email, String imageName) throws IOException {
        // Security: strip any path traversal
        String safeImageName = Paths.get(imageName).getFileName().toString();

        String userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        ServiceProvider provider = providerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        // Remove from provider document
        List<String> images = provider.getPortfolioImages();
        if (images != null) {
            images.remove(safeImageName);
            provider.setPortfolioImages(images);
            providerRepository.save(provider);
        }

        // Delete from disk
        Path file = Paths.get(uploadDir).toAbsolutePath().resolve(safeImageName);
        Files.deleteIfExists(file);
    }
}

package com.dlass.backend.service;

import com.dlass.backend.model.Category;
import com.dlass.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // CREATE CATEGORY (Admin Only Later)
    public Category createCategory(Category category) {

        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category name already exists");
        }

        String slug = generateSlug(category.getName());

        if (categoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Category slug already exists");
        }

        category.setSlug(slug);

        return categoryRepository.save(category);
    }

    // GET ALL ACTIVE CATEGORIES (Public)
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findAll()
                .stream()
                .filter(Category::isActive)
                .sorted((c1, c2) -> Integer.compare(c1.getDisplayOrder(), c2.getDisplayOrder()))
                .toList();
    }

    // GET BY SLUG
    public Category getBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    // SLUG GENERATOR
    private String generateSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("[^\\w\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toLowerCase();

        return normalized;
    }
}
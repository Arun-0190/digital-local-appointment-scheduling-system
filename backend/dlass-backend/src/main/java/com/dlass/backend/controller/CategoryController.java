package com.dlass.backend.controller;

import com.dlass.backend.model.Category;
import com.dlass.backend.service.CategoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    //Public: Get all active categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllActiveCategories();
    }

    //Admin only: Create category
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Category createCategory(@RequestBody Category category) {
        return categoryService.createCategory(category);
    }

    //Public: Get by slug
    @GetMapping("/{slug}")
    public Category getBySlug(@PathVariable String slug) {
        return categoryService.getBySlug(slug);
    }
}
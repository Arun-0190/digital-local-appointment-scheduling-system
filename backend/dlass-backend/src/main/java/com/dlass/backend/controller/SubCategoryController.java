package com.dlass.backend.controller;

import com.dlass.backend.model.SubCategory;
import com.dlass.backend.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
public class SubCategoryController {

    private final SubCategoryService service;

    public SubCategoryController(SubCategoryService service) {
        this.service = service;
    }

    // ADMIN ONLY
    @PostMapping
    public SubCategory create(@RequestBody SubCategory subCategory) {
        return service.create(subCategory);
    }

    // PUBLIC
    @GetMapping
    public List<SubCategory> getAll() {
        return service.getAll();
    }

    // PUBLIC
    @GetMapping("/by-category/{categoryId}")
    public List<SubCategory> getByCategory(@PathVariable String categoryId) {
        return service.getByCategory(categoryId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubCategory(@PathVariable String id) {
        service.deleteSubCategory(id);
        return ResponseEntity.ok("SubCategory deleted successfully");
    }
}
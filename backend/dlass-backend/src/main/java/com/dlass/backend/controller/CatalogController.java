package com.dlass.backend.controller;

import com.dlass.backend.model.Category;
import com.dlass.backend.model.SubCategory;
import com.dlass.backend.repository.CategoryRepository;
import com.dlass.backend.repository.SubCategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public CatalogController(CategoryRepository categoryRepository, SubCategoryRepository subCategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
    }

    @GetMapping("/categories")
    public List<Map<String, Object>> getCategories() {
        List<Category> categories = categoryRepository.findAll();
        
        return categories.stream().filter(Category::isActive).map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("slug", c.getSlug());
            map.put("icon", c.getIcon());
            map.put("description", c.getDescription());
            
            List<SubCategory> subCats = subCategoryRepository.findByCategoryIdAndActiveTrue(c.getId());
            map.put("subcategories", subCats);
            
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/subcategories")
    public List<SubCategory> getSubCategories(@RequestParam String categoryId) {
        return subCategoryRepository.findByCategoryIdAndActiveTrue(categoryId);
    }
}

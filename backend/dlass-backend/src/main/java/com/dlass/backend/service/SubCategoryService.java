package com.dlass.backend.service;

import com.dlass.backend.model.SubCategory;
import com.dlass.backend.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SubCategoryService {

    private final SubCategoryRepository repository;

    public SubCategoryService(SubCategoryRepository repository) {
        this.repository = repository;
    }

    public SubCategory create(SubCategory subCategory) {
        subCategory.setCreatedAt(LocalDateTime.now());
        subCategory.setUpdatedAt(LocalDateTime.now());
        return repository.save(subCategory);
    }

    public List<SubCategory> getAll() {
        return repository.findAll();
    }

    public List<SubCategory> getByCategory(String categoryId) {
        return repository.findByCategoryIdAndActiveTrue(categoryId);
    }

    public void deleteSubCategory(String id) {
        repository.deleteById(id);
    }
}
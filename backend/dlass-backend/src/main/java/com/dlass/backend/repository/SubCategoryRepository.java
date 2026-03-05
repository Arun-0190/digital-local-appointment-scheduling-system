package com.dlass.backend.repository;

import com.dlass.backend.model.SubCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SubCategoryRepository extends MongoRepository<SubCategory, String> {

    List<SubCategory> findByCategoryIdAndActiveTrue(String categoryId);
}
package com.dlass.backend.controller;

import com.dlass.backend.model.CategoryServiceMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {

    @GetMapping
    public Map<String, List<Map<String, Object>>> getCatalog() {
        Map<String, List<Map<String, Object>>> response = new HashMap<>();
        response.put("categories", CategoryServiceMap.CATEGORY_MAP);
        return response;
    }
}

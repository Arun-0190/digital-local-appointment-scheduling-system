package com.dlass.backend.seed;

import com.dlass.backend.model.Category;
import com.dlass.backend.model.SubCategory;
import com.dlass.backend.repository.CategoryRepository;
import com.dlass.backend.repository.SubCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    public CategorySeeder(CategoryRepository categoryRepository, SubCategoryRepository subCategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.subCategoryRepository = subCategoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            seedCleaning();
            seedBeautyAndSalon();
            seedMedical();
            seedHomeServices();
            System.out.println("Categories and SubCategories successfully seeded.");
        } else {
            System.out.println("Categories already exist. Skipping seed.");
        }
    }

    private void seedCleaning() {
        Category cat = new Category();
        cat.setName("Cleaning");
        cat.setSlug("cleaning");
        cat.setDescription("Home and professional cleaning services");
        cat = categoryRepository.save(cat);

        createSubCategory("Home Cleaning", "home-cleaning", cat.getId(), Arrays.asList("Deep Cleaning", "Kitchen Cleaning", "Bathroom Cleaning", "Sofa Cleaning", "Carpet Cleaning"));
        createSubCategory("Pest Control", "pest-control", cat.getId(), Arrays.asList("Termite Control", "Cockroach Control", "Mosquito Control", "Rodent Control"));
    }

    private void seedBeautyAndSalon() {
        Category cat = new Category();
        cat.setName("Beauty & Salon");
        cat.setSlug("beauty-and-salon");
        cat.setDescription("Personal grooming and salon services");
        cat = categoryRepository.save(cat);

        createSubCategory("Salon Services", "salon-services", cat.getId(), Arrays.asList("Haircut", "Hair Styling", "Hair Coloring", "Beard Grooming"));
        createSubCategory("Parlour Services", "parlour-services", cat.getId(), Arrays.asList("Facial", "Manicure", "Pedicure", "Waxing"));
    }

    private void seedMedical() {
        Category cat = new Category();
        cat.setName("Medical");
        cat.setSlug("medical");
        cat.setDescription("Medical and health checkup services");
        cat = categoryRepository.save(cat);

        createSubCategory("Dentist", "dentist", cat.getId(), Arrays.asList("Root Canal", "Teeth Cleaning", "Tooth Extraction"));
        createSubCategory("General Physician", "general-physician", cat.getId(), Arrays.asList("OPD Consultation", "Fever Treatment", "Health Checkup"));
    }

    private void seedHomeServices() {
        Category cat = new Category();
        cat.setName("Home Services");
        cat.setSlug("home-services");
        cat.setDescription("Home repair and installation services");
        cat = categoryRepository.save(cat);

        createSubCategory("Electrician", "electrician", cat.getId(), Arrays.asList("Wiring Repair", "Fan Installation", "Switch Repair"));
        createSubCategory("Plumber", "plumber", cat.getId(), Arrays.asList("Pipe Fixing", "Leakage Repair", "Bathroom Fitting"));
    }

    private void createSubCategory(String name, String slug, String categoryId, List<String> services) {
        SubCategory sub = new SubCategory();
        sub.setName(name);
        sub.setSlug(slug);
        sub.setCategoryId(categoryId);
        sub.setServices(services);
        subCategoryRepository.save(sub);
    }
}

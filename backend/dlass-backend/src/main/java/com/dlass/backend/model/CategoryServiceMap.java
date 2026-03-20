package com.dlass.backend.model;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

public class CategoryServiceMap {

    public static final List<Map<String, Object>> CATEGORY_MAP = new ArrayList<>();

    static {
        // 1. Home Cleaning & Services
        Map<String, Object> homeCleaning = new HashMap<>();
        homeCleaning.put("name", "Home Cleaning & Services");
        List<Map<String, Object>> hcSubcategories = new ArrayList<>();
        
        Map<String, Object> hcFullHome = new HashMap<>();
        hcFullHome.put("name", "Full Home Cleaning");
        hcFullHome.put("services", List.of("1 BHK Cleaning", "2 BHK Cleaning", "3 BHK Cleaning", "Villa Cleaning"));
        
        Map<String, Object> hcBathroom = new HashMap<>();
        hcBathroom.put("name", "Bathroom & Kitchen Cleaning");
        hcBathroom.put("services", List.of("Basic Bathroom Cleaning", "Deep Bathroom Cleaning", "Kitchen Deep Cleaning", "Chimney Cleaning"));
        
        Map<String, Object> hcSofa = new HashMap<>();
        hcSofa.put("name", "Sofa & Carpet Cleaning");
        hcSofa.put("services", List.of("Sofa Shampooing", "Carpet Dry Cleaning", "Mattress Cleaning", "Curtain Cleaning"));
        
        hcSubcategories.add(hcFullHome);
        hcSubcategories.add(hcBathroom);
        hcSubcategories.add(hcSofa);
        homeCleaning.put("subcategories", hcSubcategories);
        CATEGORY_MAP.add(homeCleaning);


        // 2. Appliance Repair
        Map<String, Object> applianceRepair = new HashMap<>();
        applianceRepair.put("name", "Appliance Repair");
        List<Map<String, Object>> arSubcategories = new ArrayList<>();
        
        Map<String, Object> arAc = new HashMap<>();
        arAc.put("name", "AC Service & Repair");
        arAc.put("services", List.of("AC Servicing", "AC Repair", "AC Gas Charge", "AC Installation/Uninstallation"));
        
        Map<String, Object> arRef = new HashMap<>();
        arRef.put("name", "Refrigerator Repair");
        arRef.put("services", List.of("Single Door Fridge Repair", "Double Door Fridge Repair", "Side by Side Fridge Repair"));
        
        Map<String, Object> arWashing = new HashMap<>();
        arWashing.put("name", "Washing Machine Repair");
        arWashing.put("services", List.of("Top Load Repair", "Front Load Repair", "Semi-Automatic Repair"));
        
        Map<String, Object> arGeyser = new HashMap<>();
        arGeyser.put("name", "Geyser/Water Heater Repair");
        arGeyser.put("services", List.of("Geyser Servicing", "Geyser Repair", "Geyser Installation"));
        
        arSubcategories.add(arAc);
        arSubcategories.add(arRef);
        arSubcategories.add(arWashing);
        arSubcategories.add(arGeyser);
        applianceRepair.put("subcategories", arSubcategories);
        CATEGORY_MAP.add(applianceRepair);


        // 3. Electricians, Plumbers & Carpenters
        Map<String, Object> epc = new HashMap<>();
        epc.put("name", "Electricians, Plumbers & Carpenters");
        List<Map<String, Object>> epcSubcategories = new ArrayList<>();
        
        Map<String, Object> epcElec = new HashMap<>();
        epcElec.put("name", "Electricians");
        epcElec.put("services", List.of("Switch & Socket Replacement", "Fan Repair/Installation", "Light Fitting", "Wiring Issues", "Inverter Installation"));
        
        Map<String, Object> epcPlum = new HashMap<>();
        epcPlum.put("name", "Plumbers");
        epcPlum.put("services", List.of("Tap Repair/Replacement", "Washbasin Repair", "Toilet Repair", "Water Tank Cleaning", "Blockage Removal"));
        
        Map<String, Object> epcCarp = new HashMap<>();
        epcCarp.put("name", "Carpenters");
        epcCarp.put("services", List.of("Furniture Repair", "Door/Lock Repair", "General Carpentry Work", "Furniture Assembly"));
        
        epcSubcategories.add(epcElec);
        epcSubcategories.add(epcPlum);
        epcSubcategories.add(epcCarp);
        epc.put("subcategories", epcSubcategories);
        CATEGORY_MAP.add(epc);


        // 4. Beauty & Wellness for Women
        Map<String, Object> bww = new HashMap<>();
        bww.put("name", "Beauty & Wellness for Women");
        List<Map<String, Object>> bwwSubcategories = new ArrayList<>();
        
        Map<String, Object> bwwSalon = new HashMap<>();
        bwwSalon.put("name", "Salon at Home");
        bwwSalon.put("services", List.of("Waxing", "Facial & Cleanup", "Manicure & Pedicure", "Threading", "Haircut & Styling"));
        
        Map<String, Object> bwwSpa = new HashMap<>();
        bwwSpa.put("name", "Spa for Women");
        bwwSpa.put("services", List.of("Swedish Massage", "Deep Tissue Massage", "Head & Shoulder Massage", "Body Polish"));
        
        Map<String, Object> bwwMakeup = new HashMap<>();
        bwwMakeup.put("name", "Makeup & Styling");
        bwwMakeup.put("services", List.of("Bridal Makeup", "Party Makeup", "Guest Makeup", "Hair Styling"));
        
        bwwSubcategories.add(bwwSalon);
        bwwSubcategories.add(bwwSpa);
        bwwSubcategories.add(bwwMakeup);
        bww.put("subcategories", bwwSubcategories);
        CATEGORY_MAP.add(bww);


        // 5. Men's Grooming & Wellness
        Map<String, Object> mgw = new HashMap<>();
        mgw.put("name", "Men's Grooming & Wellness");
        List<Map<String, Object>> mgwSubcategories = new ArrayList<>();
        
        Map<String, Object> mgwSalon = new HashMap<>();
        mgwSalon.put("name", "Salon for Men");
        mgwSalon.put("services", List.of("Haircut", "Beard Styling/Shave", "Hair Color", "Face Care/Detan", "Pedicure for Men"));
        
        Map<String, Object> mgwSpa = new HashMap<>();
        mgwSpa.put("name", "Massage Therapy for Men");
        mgwSpa.put("services", List.of("Stress Relief Massage", "Pain Relief Massage", "Sports Massage"));
        
        mgwSubcategories.add(mgwSalon);
        mgwSubcategories.add(mgwSpa);
        mgw.put("subcategories", mgwSubcategories);
        CATEGORY_MAP.add(mgw);


        // 6. Home Painting & Waterproofing
        Map<String, Object> hpw = new HashMap<>();
        hpw.put("name", "Home Painting & Waterproofing");
        List<Map<String, Object>> hpwSubcategories = new ArrayList<>();
        
        Map<String, Object> hpwPaint = new HashMap<>();
        hpwPaint.put("name", "Interior & Exterior Painting");
        hpwPaint.put("services", List.of("Full Home Painting", "Single Room Painting", "Exterior Painting", "Texture Painting", "Wood & Metal Polish"));
        
        Map<String, Object> hpwWater = new HashMap<>();
        hpwWater.put("name", "Waterproofing Services");
        hpwWater.put("services", List.of("Roof Waterproofing", "Bathroom Waterproofing", "Wall Seepage Treatment"));
        
        hpwSubcategories.add(hpwPaint);
        hpwSubcategories.add(hpwWater);
        hpw.put("subcategories", hpwSubcategories);
        CATEGORY_MAP.add(hpw);


        // 7. Packers & Movers
        Map<String, Object> pm = new HashMap<>();
        pm.put("name", "Packers & Movers");
        List<Map<String, Object>> pmSubcategories = new ArrayList<>();
        
        Map<String, Object> pmLocal = new HashMap<>();
        pmLocal.put("name", "Local Shifting");
        pmLocal.put("services", List.of("Within City Shifting", "Micro Shifting (Few Items)"));
        
        Map<String, Object> pmInter = new HashMap<>();
        pmInter.put("name", "Intercity Shifting");
        pmInter.put("services", List.of("Between Cities Shifting", "Vehicle Transport (Car/Bike)"));
        
        pmSubcategories.add(pmLocal);
        pmSubcategories.add(pmInter);
        pm.put("subcategories", pmSubcategories);
        CATEGORY_MAP.add(pm);


        // 8. Pest Control
        Map<String, Object> pest = new HashMap<>();
        pest.put("name", "Pest Control");
        List<Map<String, Object>> pestSubcategories = new ArrayList<>();
        
        Map<String, Object> pestGen = new HashMap<>();
        pestGen.put("name", "Pest Control Services");
        pestGen.put("services", List.of("Cockroach & Ant Control", "Termite Control", "Bed Bug Control", "Mosquito Control", "Rodent Control"));
        
        pestSubcategories.add(pestGen);
        pest.put("subcategories", pestSubcategories);
        CATEGORY_MAP.add(pest);


        // 9. Personal Tutors
        Map<String, Object> tutors = new HashMap<>();
        tutors.put("name", "Personal Tutors");
        List<Map<String, Object>> tutorsSubcategories = new ArrayList<>();
        
        Map<String, Object> tutorsAcad = new HashMap<>();
        tutorsAcad.put("name", "Academic Tutors");
        tutorsAcad.put("services", List.of("Math Tuition (Classes 1-12)", "Science Tuition (Classes 1-12)", "English Tuition", "Exam Preparation (Board Exams)", "Language Classes"));
        
        Map<String, Object> tutorsHobby = new HashMap<>();
        tutorsHobby.put("name", "Hobbies & Extracurriculars");
        tutorsHobby.put("services", List.of("Guitar/Keyboard Lessons", "Vocal Music Training", "Dance Classes (Zumba, Western, Classical)", "Art & Craft Workshops", "Yoga Classes"));
        
        tutorsSubcategories.add(tutorsAcad);
        tutorsSubcategories.add(tutorsHobby);
        tutors.put("subcategories", tutorsSubcategories);
        CATEGORY_MAP.add(tutors);


        // 10. IT & Hardware
        Map<String, Object> it = new HashMap<>();
        it.put("name", "IT & Hardware");
        List<Map<String, Object>> itSubcategories = new ArrayList<>();
        
        Map<String, Object> itLapt = new HashMap<>();
        itLapt.put("name", "Laptop/Computer Setup");
        itLapt.put("services", List.of("Windows Installation", "Software Installation", "Printer Setup", "Network Setup", "Hardware Repair"));
        
        itSubcategories.add(itLapt);
        it.put("subcategories", itSubcategories);
        CATEGORY_MAP.add(it);


        // 11. Custom Jobs (Tender)
        Map<String, Object> custom = new HashMap<>();
        custom.put("name", "Custom Jobs (Tender)");
        List<Map<String, Object>> customSubcategories = new ArrayList<>();
        
        Map<String, Object> customJob = new HashMap<>();
        customJob.put("name", "Custom Work");
        customJob.put("services", List.of("Event Management", "Home Renovation", "Custom Furniture Design", "Catering Services", "Others"));
        
        customSubcategories.add(customJob);
        custom.put("subcategories", customSubcategories);
        CATEGORY_MAP.add(custom);
    }
}

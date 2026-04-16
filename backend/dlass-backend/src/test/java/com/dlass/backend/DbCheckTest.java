package com.dlass.backend;

import com.dlass.backend.model.User;
import com.dlass.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.core.MongoTemplate;
import com.mongodb.client.MongoCollection;
import org.bson.Document;

import java.util.List;

@SpringBootTest(properties = "spring.data.mongodb.uri=mongodb+srv://arunishere2003_db_user:nWqqsl3Ffaum62Uu@mycluster.u8zrdyj.mongodb.net/dlass_db?retryWrites=true&w=majority")
public class DbCheckTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Test
    public void checkCollections() {
        System.out.println("[DB_CHECK] Current collections in dlass_db:");
        for (String name : mongoTemplate.getCollectionNames()) {
            System.out.println("[DB_CHECK] COLLECTION: " + name + " (Count: " + mongoTemplate.getCollection(name).countDocuments() + ")");
        }
        
        System.out.println("[DB_CHECK] Searching for 'newuser' in all collections...");
        for (String name : mongoTemplate.getCollectionNames()) {
            Document found = mongoTemplate.getCollection(name).find(new Document("email", "newuser@dlass.com")).first();
            if (found != null) {
                System.out.println("[DB_CHECK] FOUND USER IN COLLECTION: " + name);
                System.out.println("[DB_CHECK] DOC: " + found.toJson());
            }
        }
    }
}

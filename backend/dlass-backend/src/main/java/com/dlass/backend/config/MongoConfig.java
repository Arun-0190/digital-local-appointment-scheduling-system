package com.dlass.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        if (mongoUri == null || mongoUri.isBlank()) {
            throw new RuntimeException("[DLASS] FATAL: spring.data.mongodb.uri is not configured. Localhost fallback is disabled.");
        }

        // Diagnostics: Mask credentials and log the host
        String host = "unknown";
        try {
            ConnectionString connectionString = new ConnectionString(mongoUri);
            host = String.join(",", connectionString.getHosts());
        } catch (Exception e) {
            host = "PARSE_ERROR";
        }
        
        System.out.println("[DLASS] FORCED MONGO CONNECTION: " + host);

        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(mongoUri))
                .build();

        return MongoClients.create(settings);
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(mongoClient(), getDatabaseName()));
    }

    private String getDatabaseName() {
        try {
            ConnectionString connectionString = new ConnectionString(mongoUri);
            return connectionString.getDatabase() != null ? connectionString.getDatabase() : "dlass_db";
        } catch (Exception e) {
            return "dlass_db";
        }
    }
}

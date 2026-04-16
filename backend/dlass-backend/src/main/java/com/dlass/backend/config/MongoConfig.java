package com.dlass.backend.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.data.mongodb.core.convert.DbRefResolver;
import org.springframework.data.mongodb.core.convert.DefaultDbRefResolver;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class MongoConfig {

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    @Bean
    public MongoClient mongoClient() {
        if (mongoUri == null || mongoUri.isBlank()) {
            throw new RuntimeException("[DLASS] FATAL: spring.data.mongodb.uri is not configured.");
        }

        String host = "unknown";
        try {
            ConnectionString connectionString = new ConnectionString(mongoUri);
            host = String.join(",", connectionString.getHosts());
        } catch (Exception e) {
            host = "PARSE_ERROR";
        }
        
        System.out.println("[DLASS] MONGO: Attempting connection to [" + host + "] database [" + getDatabaseName() + "]");

        MongoClientSettings settings = MongoClientSettings.builder()
                .applyConnectionString(new ConnectionString(mongoUri))
                .build();

        return MongoClients.create(settings);
    }

    @Bean
    public MongoCustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new StringToLocalDateConverter());
        converters.add(new StringToLocalDateTimeConverter());
        converters.add(new StringToLocalTimeConverter());
        converters.add(new DateToLocalDateConverter());
        converters.add(new DateToLocalDateTimeConverter());
        return new MongoCustomConversions(converters);
    }

    @Bean
    public MappingMongoConverter mappingMongoConverter(MongoDatabaseFactory factory, MongoCustomConversions conversions, MongoMappingContext context) {
        DbRefResolver dbRefResolver = new DefaultDbRefResolver(factory);
        MappingMongoConverter converter = new MappingMongoConverter(dbRefResolver, context);
        converter.setCustomConversions(conversions);
        return converter;
    }

    @Bean
    public MongoTemplate mongoTemplate(MongoDatabaseFactory factory, MappingMongoConverter converter) {
        return new MongoTemplate(factory, converter);
    }

    @ReadingConverter
    public static class StringToLocalDateConverter implements Converter<String, LocalDate> {
        @Override
        public LocalDate convert(String source) {
            if (source == null || source.isBlank()) return null;
            try {
                if (source.contains("T")) {
                    return OffsetDateTime.parse(source).toLocalDate();
                }
                return LocalDate.parse(source);
            } catch (Exception e) {
                return null;
            }
        }
    }

    @ReadingConverter
    public static class StringToLocalDateTimeConverter implements Converter<String, LocalDateTime> {
        @Override
        public LocalDateTime convert(String source) {
            if (source == null || source.isBlank()) return null;
            try {
                if (source.contains("T")) {
                    return OffsetDateTime.parse(source).toLocalDateTime();
                }
                // Fallback for yyyy-MM-dd strings stored in date-time fields
                if (source.length() == 10 && source.indexOf("-") == 4) {
                    return LocalDate.parse(source).atStartOfDay();
                }
                return LocalDateTime.parse(source);
            } catch (Exception e) {
                return null;
            }
        }
    }

    @ReadingConverter
    public static class DateToLocalDateConverter implements Converter<Date, LocalDate> {
        @Override
        public LocalDate convert(Date source) {
            if (source == null) return null;
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
    }

    @ReadingConverter
    public static class DateToLocalDateTimeConverter implements Converter<Date, LocalDateTime> {
        @Override
        public LocalDateTime convert(Date source) {
            if (source == null) return null;
            return source.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
    }

    @ReadingConverter
    public static class StringToLocalTimeConverter implements Converter<String, LocalTime> {
        @Override
        public LocalTime convert(String source) {
            if (source == null || source.isBlank()) return null;
            try {
                // Handle HH:mm:ss or HH:m forms
                return LocalTime.parse(source);
            } catch (Exception e) {
                try {
                    if (source.contains("T")) {
                        return OffsetDateTime.parse(source).toLocalTime();
                    }
                } catch (Exception e2) { }
                return null;
            }
        }
    }

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, getDatabaseName());
    }

    private String getDatabaseName() {
        try {
            ConnectionString connectionString = new ConnectionString(mongoUri);
            String db = connectionString.getDatabase();
            if (db == null || db.isBlank()) {
                throw new RuntimeException("[DLASS] FATAL: MONGODB_URI is missing the database name.");
            }
            return db;
        } catch (Exception e) {
            throw new RuntimeException("[DLASS] FATAL: Invalid MONGODB_URI format.", e);
        }
    }
}


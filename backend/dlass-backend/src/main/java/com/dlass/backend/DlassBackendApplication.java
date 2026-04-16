package com.dlass.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class DlassBackendApplication {

	public static void main(String[] args) {

		Dotenv dotenv = Dotenv.load();

		// Set MongoDB Atlas URI
		String mongodbUri = dotenv.get("MONGODB_URI");
		if (mongodbUri != null) {
			System.setProperty("MONGODB_URI", mongodbUri);
			// Also set the direct spring property for maximum compatibility
			System.setProperty("spring.data.mongodb.uri", mongodbUri);
		}

		// Set Mail Config
		System.setProperty("MAIL_HOST", dotenv.get("MAIL_HOST") != null ? dotenv.get("MAIL_HOST") : "");
		System.setProperty("MAIL_PORT", dotenv.get("MAIL_PORT") != null ? dotenv.get("MAIL_PORT") : "");
		System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME") != null ? dotenv.get("MAIL_USERNAME") : "");
		System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD") != null ? dotenv.get("MAIL_PASSWORD") : "");
		
		// Set Admin Credentials
		System.setProperty("ADMIN_EMAIL", dotenv.get("ADMIN_EMAIL") != null ? dotenv.get("ADMIN_EMAIL") : "");
		System.setProperty("ADMIN_PASSWORD", dotenv.get("ADMIN_PASSWORD") != null ? dotenv.get("ADMIN_PASSWORD") : "");
		System.setProperty("ADMIN_NAME", dotenv.get("ADMIN_NAME") != null ? dotenv.get("ADMIN_NAME") : "DLASS Admin");

		SpringApplication.run(DlassBackendApplication.class, args);
	}
}

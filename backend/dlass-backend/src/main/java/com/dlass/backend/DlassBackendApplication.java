package com.dlass.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class DlassBackendApplication {

	public static void main(String[] args) {
		// Load .env reliably before Spring starts
		Dotenv dotenv = Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.systemProperties() // Set environment variables as system properties
				.load();

		SpringApplication.run(DlassBackendApplication.class, args);
	}
}








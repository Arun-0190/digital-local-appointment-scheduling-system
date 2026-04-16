package com.dlass.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
@EnableScheduling
public class DlassBackendApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

		// Helper to get from Dotenv or System Env
		autoGetEnv(dotenv, "MONGODB_URI", "spring.data.mongodb.uri");
		autoGetEnv(dotenv, "JWT_SECRET", "app.jwt.secret");
		autoGetEnv(dotenv, "FRONTEND_URL", "app.frontend-url");
		autoGetEnv(dotenv, "MAIL_HOST", "MAIL_HOST");
		autoGetEnv(dotenv, "MAIL_PORT", "MAIL_PORT");
		autoGetEnv(dotenv, "MAIL_USERNAME", "MAIL_USERNAME");
		autoGetEnv(dotenv, "MAIL_PASSWORD", "MAIL_PASSWORD");
		autoGetEnv(dotenv, "ADMIN_EMAIL", "ADMIN_EMAIL");
		autoGetEnv(dotenv, "ADMIN_PASSWORD", "ADMIN_PASSWORD");
		autoGetEnv(dotenv, "ADMIN_NAME", "ADMIN_NAME");

		SpringApplication.run(DlassBackendApplication.class, args);
	}

	private static void autoGetEnv(Dotenv dotenv, String key, String systemProp) {
		String value = dotenv.get(key);
		if (value == null) {
			value = System.getenv(key);
		}
		if (value != null) {
			System.setProperty(systemProp, value);
		}
	}
}

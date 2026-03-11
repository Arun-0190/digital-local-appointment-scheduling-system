package com.dlass.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DlassBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(DlassBackendApplication.class, args);
	}

}

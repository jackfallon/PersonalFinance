package com.jfallon.finance_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class PersonalFinanceAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(PersonalFinanceAppApplication.class, args);
	}

}

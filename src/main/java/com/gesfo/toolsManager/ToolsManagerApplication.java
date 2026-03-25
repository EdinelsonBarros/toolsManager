package com.gesfo.toolsManager;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;

@SpringBootApplication(exclude = {
	    HibernateJpaAutoConfiguration.class,
	    DataJpaRepositoriesAutoConfiguration.class
	})
public class ToolsManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ToolsManagerApplication.class, args);
	}

}

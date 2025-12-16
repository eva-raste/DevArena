package com.devarena;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DevArenaApplication {
    public static void main(String[] args) {
//        System.out.println("DB_URL = " + System.getenv("DB_URL"));

        SpringApplication.run(DevArenaApplication.class, args);
    }
}

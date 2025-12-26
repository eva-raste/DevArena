package com.devarena;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
//@ComponentScan("com.devarena")
public class DevArenaApplication {
    public static void main(String[] args) {

        SpringApplication.run(DevArenaApplication.class, args);
    }
}
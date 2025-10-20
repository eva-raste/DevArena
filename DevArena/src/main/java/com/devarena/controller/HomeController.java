package com.devarena.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class HomeController {

    @GetMapping("/hello")
    public String sayHello() {
        return "Welcome to DevArena 🚀";
    }
}

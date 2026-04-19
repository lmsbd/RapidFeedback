package com.unimelb.swen90017.rfo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class RfoApplication {

    public static void main(String[] args) {
        SpringApplication.run(RfoApplication.class, args);
    }

}
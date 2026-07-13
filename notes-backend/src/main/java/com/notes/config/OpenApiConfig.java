package com.notes.config;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.*;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
public class OpenApiConfig implements AsyncConfigurer {
    @Bean public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info().title("Notes Étudiantes API").version("1.0.0")
                .description("API REST — Système de Gestion des Notes Étudiantes · PKFokam")
                .contact(new Contact().name("PKFokam Institute").email("dev@pkfokam.edu")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
            .components(new Components().addSecuritySchemes("Bearer Auth",
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")));
    }
    @Override @Bean(name="taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(5); ex.setMaxPoolSize(10); ex.setQueueCapacity(100);
        ex.setThreadNamePrefix("Async-"); ex.initialize(); return ex;
    }
}

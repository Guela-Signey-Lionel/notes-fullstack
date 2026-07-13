package com.notes.exception;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestControllerAdvice @Slf4j
public class GlobalExceptionHandler {
    record Err(LocalDateTime timestamp, int status, String error, String message, Map<String,String> fields) {}

    @ExceptionHandler(NotesException.class)
    public ResponseEntity<Err> handle(NotesException e) {
        return ResponseEntity.status(e.getStatus()).body(new Err(LocalDateTime.now(), e.getStatus().value(), e.getCode(), e.getMessage(), null));
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Err> handleValidation(MethodArgumentNotValidException e) {
        Map<String,String> errs = new LinkedHashMap<>();
        e.getBindingResult().getAllErrors().forEach(err -> errs.put(err instanceof FieldError fe ? fe.getField() : err.getObjectName(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(new Err(LocalDateTime.now(), 400,"VALIDATION_ERROR","Données invalides", errs));
    }
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Err> handleBadCreds(BadCredentialsException e) {
        return ResponseEntity.status(401).body(new Err(LocalDateTime.now(),401,"UNAUTHORIZED","Email ou mot de passe incorrect",null));
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Err> handleAccess(AccessDeniedException e) {
        return ResponseEntity.status(403).body(new Err(LocalDateTime.now(),403,"FORBIDDEN","Accès refusé",null));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Err> handleAll(Exception e) {
        log.error("Erreur: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError().body(new Err(LocalDateTime.now(),500,"INTERNAL_ERROR","Erreur interne",null));
    }
}

package com.notes.repository;
import com.notes.entity.Filiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface FiliereRepository extends JpaRepository<Filiere, UUID> {
    List<Filiere> findByActif(boolean actif);
    boolean existsByCode(String code);
}

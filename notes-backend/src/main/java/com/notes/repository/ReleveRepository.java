package com.notes.repository;
import com.notes.entity.Releve;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface ReleveRepository extends JpaRepository<Releve, UUID> {
    Optional<Releve> findByEtudiantIdAndSemestreId(UUID etudiantId, UUID semestreId);
    List<Releve> findByEtudiantId(UUID etudiantId);
}

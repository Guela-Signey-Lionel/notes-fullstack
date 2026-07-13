package com.notes.repository;
import com.notes.entity.UniteEnseignement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface UniteEnseignementRepository extends JpaRepository<UniteEnseignement, UUID> {
    List<UniteEnseignement> findBySemestreId(UUID semestreId);
}

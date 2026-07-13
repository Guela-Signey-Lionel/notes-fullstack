package com.notes.repository;
import com.notes.entity.MoyenneCalculee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface MoyenneCalculeeRepository extends JpaRepository<MoyenneCalculee, UUID> {
    Optional<MoyenneCalculee> findByEtudiantIdAndSemestreId(UUID etudiantId, UUID semestreId);
    List<MoyenneCalculee> findBySemestreIdOrderByRangAsc(UUID semestreId);
    @Query("SELECT m FROM MoyenneCalculee m WHERE m.semestre.id = :semestreId ORDER BY m.moyenne DESC NULLS LAST")
    List<MoyenneCalculee> findBySemestreIdOrderByMoyenneDesc(@Param("semestreId") UUID semestreId);
    List<MoyenneCalculee> findByEtudiantIdOrderBySemestreNumeroAsc(UUID etudiantId);
    void deleteByEtudiantIdAndSemestreId(UUID etudiantId, UUID semestreId);
}

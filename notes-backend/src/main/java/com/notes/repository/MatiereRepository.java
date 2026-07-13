package com.notes.repository;
import com.notes.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface MatiereRepository extends JpaRepository<Matiere, UUID> {
    List<Matiere> findByUeId(UUID ueId);
    List<Matiere> findByEnseignantId(UUID enseignantId);
    @Query("SELECT m FROM Matiere m JOIN m.ue ue WHERE ue.semestre.id = :semestreId")
    List<Matiere> findBySemestreId(@Param("semestreId") UUID semestreId);
    @Query("SELECT m FROM Matiere m JOIN m.ue ue JOIN ue.semestre s JOIN s.promotion p WHERE p.id = :promotionId AND s.id = :semestreId")
    List<Matiere> findByPromotionAndSemestre(@Param("promotionId") UUID promotionId, @Param("semestreId") UUID semestreId);
}

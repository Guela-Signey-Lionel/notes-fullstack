package com.notes.repository;
import com.notes.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface SemestreRepository extends JpaRepository<Semestre, UUID> {
    List<Semestre> findByPromotionId(UUID promotionId);
    List<Semestre> findByStatut(StatutSemestre statut);
    List<Semestre> findByPromotionIdAndStatut(UUID promotionId, StatutSemestre statut);
}

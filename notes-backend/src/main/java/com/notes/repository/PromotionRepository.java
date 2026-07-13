package com.notes.repository;
import com.notes.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    List<Promotion> findByFiliereIdAndActif(UUID filiereId, boolean actif);
    List<Promotion> findByActif(boolean actif);
}

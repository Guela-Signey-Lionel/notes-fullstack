package com.notes.repository;
import com.notes.entity.Etudiant;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, UUID> {
    Optional<Etudiant> findByNumeroEtudiant(String numero);
    boolean existsByNumeroEtudiant(String numero);
    @Query("SELECT e FROM Etudiant e JOIN e.promotions p WHERE p.id = :promotionId")
    List<Etudiant> findByPromotionId(@Param("promotionId") UUID promotionId);
    Optional<Etudiant> findByUtilisateur(com.notes.entity.Utilisateur utilisateur);

    @Query("SELECT e FROM Etudiant e WHERE LOWER(e.utilisateur.nom) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(e.utilisateur.prenom) LIKE LOWER(CONCAT('%',:q,'%')) OR e.numeroEtudiant LIKE CONCAT('%',:q,'%')")
    Page<Etudiant> rechercher(@Param("q") String q, Pageable pageable);
}

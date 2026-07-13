package com.notes.repository;
import com.notes.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByEtudiantIdAndMatiereId(UUID etudiantId, UUID matiereId);
    Optional<Note> findByEtudiantIdAndMatiereIdAndTypeNote(UUID etudiantId, UUID matiereId, TypeNote typeNote);
    List<Note> findByMatiereId(UUID matiereId);
    @Query("SELECT n FROM Note n WHERE n.matiere.id = :matiereId AND n.verrouille = false")
    List<Note> findByMatiereIdNonVerrouille(@Param("matiereId") UUID matiereId);
    @Query("SELECT n FROM Note n JOIN n.matiere m JOIN m.ue ue WHERE ue.semestre.id = :semestreId AND n.etudiant.id = :etudiantId")
    List<Note> findByEtudiantAndSemestre(@Param("etudiantId") UUID etudiantId, @Param("semestreId") UUID semestreId);
    @Query("SELECT COUNT(n) FROM Note n JOIN n.matiere m JOIN m.ue ue WHERE ue.semestre.id = :semestreId AND n.matiere.id IN (SELECT mat.id FROM Matiere mat WHERE mat.enseignant.id = :enseignantId) AND n.verrouille = true")
    long countVerrouillesByEnseignantAndSemestre(@Param("enseignantId") UUID enseignantId, @Param("semestreId") UUID semestreId);
    @Query("SELECT AVG(n.valeur) FROM Note n WHERE n.matiere.id = :matiereId AND n.statut = 'PRESENT'")
    Double avgByMatiere(@Param("matiereId") UUID matiereId);
    @Query("SELECT MIN(n.valeur) FROM Note n WHERE n.matiere.id = :matiereId AND n.statut = 'PRESENT'")
    Double minByMatiere(@Param("matiereId") UUID matiereId);
    @Query("SELECT MAX(n.valeur) FROM Note n WHERE n.matiere.id = :matiereId AND n.statut = 'PRESENT'")
    Double maxByMatiere(@Param("matiereId") UUID matiereId);
}

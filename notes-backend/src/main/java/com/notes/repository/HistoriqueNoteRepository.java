package com.notes.repository;
import com.notes.entity.HistoriqueNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface HistoriqueNoteRepository extends JpaRepository<HistoriqueNote, UUID> {
    List<HistoriqueNote> findByNoteIdOrderByDateModificationDesc(UUID noteId);
}

package com.notes.repository;
import com.notes.entity.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, UUID> {}

package com.notes.repository;
import com.notes.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {
    Optional<Utilisateur> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Utilisateur> findByRole(RoleUtilisateur role);
    List<Utilisateur> findByRoleAndActif(RoleUtilisateur role, boolean actif);
}

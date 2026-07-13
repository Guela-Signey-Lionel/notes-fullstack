# Notes Étudiantes — Backend API

Spring Boot 3.2 · Java 17 · PostgreSQL · JWT · PDFBox · Apache POI

## Stack technique
| Composant       | Technologie                       |
|-----------------|-----------------------------------|
| Framework       | Spring Boot 3.2                   |
| Sécurité        | Spring Security + JWT (jjwt 0.12) |
| Base de données | PostgreSQL 15 + Flyway            |
| PDF             | Apache PDFBox 3                   |
| Excel           | Apache POI 5                      |
| Import CSV      | OpenCSV 5                         |
| Documentation   | SpringDoc OpenAPI 3 (Swagger UI)  |
| Déploiement     | Docker + Docker Compose           |

## Démarrage rapide

```bash
# 1. Cloner et configurer
cp .env.example .env

# 2. Build + Docker Compose
mvn clean package -DskipTests
docker-compose up -d

# OU démarrage local (PostgreSQL requis sur port 5433)
mvn spring-boot:run
```

## Accès
| Service    | URL                                   |
|------------|---------------------------------------|
| API REST   | http://localhost:8081/api/v1          |
| Swagger UI | http://localhost:8081/swagger-ui.html |
| Health     | http://localhost:8081/actuator/health |

## Compte admin par défaut
```
Email    : admin@pkfokam.edu
Password : Admin@2026
```

## Architecture des modules
```
com.notes/
├── config/         SecurityConfig, OpenApiConfig (Async)
├── security/       JwtService, JwtAuthFilter
├── entity/         11 entités JPA + 6 enums
├── repository/     12 repositories avec requêtes JPQL
├── dto/
│   ├── request/   10 DTOs de requête
│   └── response/  12 DTOs de réponse
├── service/        AuthService, ReferentielService, NoteService,
│                   MoyenneService, UtilisateurService, ExportService
├── controller/     5 controllers REST (Auth, Referentiel, Note, Moyenne, Export, Utilisateur)
└── exception/      NotesException + GlobalExceptionHandler
```

## Endpoints principaux

### Authentification
| Méthode | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/login | Connexion JWT |
| POST | /api/v1/auth/refresh | Renouvellement token |
| POST | /api/v1/auth/logout | Déconnexion |

### Référentiel
| Méthode | Endpoint | Rôles |
|---|---|---|
| GET | /api/v1/filieres | Tous |
| POST | /api/v1/filieres | ADMIN |
| GET/POST | /api/v1/promotions | Tous / ADMIN |
| GET/POST | /api/v1/semestres | Tous / ADMIN |
| PATCH | /api/v1/semestres/{id}/cloturer | ADMIN |
| GET/POST | /api/v1/ue | Tous / ADMIN |
| GET/POST | /api/v1/matieres | Tous / ADMIN |

### Notes
| Méthode | Endpoint | Rôles |
|---|---|---|
| POST | /api/v1/notes | ENSEIGNANT |
| POST | /api/v1/notes/batch | ENSEIGNANT |
| PUT | /api/v1/notes/{id}/corriger | ENSEIGNANT, ADMIN |
| PATCH | /api/v1/notes/matieres/{id}/verrouiller | ENSEIGNANT, ADMIN |
| POST | /api/v1/notes/import/csv | ENSEIGNANT, ADMIN |

### Moyennes & Classements
| Méthode | Endpoint | Rôles |
|---|---|---|
| GET | /api/v1/moyennes/etudiant/{id}/semestre/{id} | Tous |
| GET | /api/v1/moyennes/classement/promotion/{id}/semestre/{id} | ADMIN, ENSEIGNANT |
| GET | /api/v1/moyennes/etudiant/{id}/historique | Tous |
| GET | /api/v1/moyennes/stats/matiere/{id} | ADMIN, ENSEIGNANT |

### Exports
| Méthode | Endpoint | Rôles |
|---|---|---|
| GET | /api/v1/export/releve/{etudiantId}/semestre/{semestreId} | Tous |
| GET | /api/v1/export/classement/promotion/{id}/semestre/{id}/excel | ADMIN, ENSEIGNANT |
| GET | /api/v1/export/notes/matiere/{id}/excel | ADMIN, ENSEIGNANT |

## Moteur de calcul des moyennes

```
Note finale matière = CC × 0.4 + Examen × 0.6 (si CC et Examen présents)
                    = Note unique (sinon)

Moyenne UE = Σ(noteMatière × coeffMatière) / Σ(coefficients)

Moyenne semestielle = Σ(moyenneUE × créditsECTS) / Σ(crédits)
```

### Barème des mentions (configurable)
| Moyenne | Mention |
|---|---|
| ≥ 16 | Très Bien |
| ≥ 14 | Bien |
| ≥ 12 | Assez Bien |
| ≥ 10 | Passable |
| < 10 | Ajourné |

## Format CSV import notes
```
numero_etudiant;note;commentaire
GI2021001;14.5;Bon travail
GI2021002;12;
GI2021003;8.5;Peut mieux faire
```

## Format CSV import étudiants
```
nom;prenom;email;numero_etudiant
Dupont;Marie;marie.dupont@pkfokam.edu;GI2024001
Martin;Jean;jean.martin@pkfokam.edu;GI2024002
```

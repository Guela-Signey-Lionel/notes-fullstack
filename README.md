# 🎓 Notes Étudiantes — Fullstack

Système de gestion des notes étudiantes pour PKFokam — Backend Spring Boot + Frontend Next.js

## Architecture

```
notes-fullstack/
├── notes-backend/    → API REST (Spring Boot 3.2 / Java 17 / PostgreSQL)
├── notes-frontend/   → Interface web (Next.js 16 / React 19 / Tailwind / Prisma/SQLite)
└── README.md
```

## Prérequis

| Outil       | Version requise                    |
|-------------|------------------------------------|
| Java        | 17+                                |
| Maven       | 3.8+                               |
| Node.js     | 18+ (ou Bun)                       |
| PostgreSQL  | 15+                                |

## 1. Base de données

Le backend utilise **PostgreSQL**. Créez la base et l'utilisateur :

```sql
CREATE DATABASE notes_db;
CREATE USER notes_user WITH PASSWORD 'notes_pass';
GRANT ALL PRIVILEGES ON DATABASE notes_db TO notes_user;
```

Ou utilisez Docker :

```bash
cd notes-backend
docker-compose up -d postgres
```

> Les migrations Flyway s'exécutent automatiquement au démarrage.

## 2. Backend (API REST)

```bash
cd notes-backend

# Configurer les variables d'environnement (optionnel)
cp .env.example .env

# Build et démarrage
mvn clean package -DskipTests
java -jar target/notes-backend-1.0.0.jar
```

Ou directement avec Maven :

```bash
mvn spring-boot:run
```

**L'API démarre sur** : `http://localhost:8081`

| Ressource       | URL                                      |
|-----------------|------------------------------------------|
| API REST        | http://localhost:8081/api/v1             |
| Swagger UI      | http://localhost:8081/swagger-ui.html    |
| Health check    | http://localhost:8081/actuator/health    |

### Compte admin par défaut

```
Email    : admin@pkfokam.edu
Password : Admin@2026
```

### Variables d'environnement

| Variable           | Défaut                                          | Description                     |
|--------------------|-------------------------------------------------|---------------------------------|
| `DB_URL`           | `jdbc:postgresql://localhost:5432/notes_db`     | URL de connexion PostgreSQL     |
| `DB_USERNAME`      | `notes_user`                                    | Utilisateur PostgreSQL          |
| `DB_PASSWORD`      | `notes_pass`                                    | Mot de passe PostgreSQL         |
| `SERVER_PORT`      | `8081`                                          | Port du serveur backend         |
| `JWT_SECRET`       | (généré)                                        | Secret pour les tokens JWT      |
| `CORS_ORIGINS`     | `http://localhost:3000,http://localhost:4200`    | Origines CORS autorisées        |
| `MAIL_HOST`        | `smtp.gmail.com`                                | Serveur SMTP                    |
| `MAIL_USERNAME`    | (vide)                                          | Email SMTP                      |
| `MAIL_PASSWORD`    | (vide)                                          | Mot de passe SMTP               |

## 3. Frontend (Interface Web)

```bash
cd notes-frontend

# Installer les dépendances
bun install        # ou npm install

# Configurer la base de données Prisma (SQLite)
bunx prisma generate
bunx prisma db push

# Démarrer en mode développement
bun run dev
```

> En mode développement, le frontend est sur `http://localhost:3000` et communique avec le backend via des API routes Next.js (proxy interne vers `http://localhost:8081`).

### Build de production

```bash
bun run build
bun run start
```

## 4. Démarrage simultané

Dans deux terminaux séparés :

```bash
# Terminal 1 — Backend
cd notes-backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd notes-frontend && bun run dev
```

Puis ouvrez http://localhost:3000 dans votre navigateur.

## 5. Docker (Backend complet)

```bash
cd notes-backend
docker-compose up -d
```

Cela lance PostgreSQL (port 5436) + le backend (port 8081).

---

## Dépannage

### Erreur `BindException: Adresse déjà utilisée` (port 8081)

Une instance du backend tourne déjà sur le port 8081. Pour la arrêter :

```bash
# Trouver le processus qui utilise le port 8081
lsof -i :8081

# Tuer le processus (remplacer <PID> par le numéro obtenu)
kill -9 <PID>
```

Ou changez de port :

```bash
SERVER_PORT=8082 mvn spring-boot:run
```

### Erreur `Standard Commons Logging discovery`

Ce message est une simple information de Spring, pas une erreur. Il disparaît automatiquement en supprimant `commons-logging.jar` du classpath (aucune action requise).

### Flyway : `PostgreSQL X is newer than this version of Flyway`

Flyway 9.22 ne teste pas les versions de PostgreSQL au-delà de 15. C'est un avertissement, pas une erreur — les migrations fonctionnent normalement.

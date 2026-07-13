# Notes Étudiantes — Frontend Angular

Angular 17 · Standalone Components · Angular Material · Chart.js

## Stack
| Composant | Technologie |
|---|---|
| Framework | Angular 17 (Standalone) |
| UI | Angular Material 17 |
| Graphiques | Chart.js + ng2-charts |
| State | Angular Signals |
| Forms | ReactiveFormsModule |
| Build | Angular CLI + esbuild |
| Déploiement | Docker + Nginx |

## Démarrage rapide

```bash
# Développement
npm install --legacy-peer-deps
npm start
# → http://localhost:4200

# Production Docker
cp .env.example .env
docker-compose up -d
# → http://localhost:4201
```

## Comptes de démo
| Rôle | Email | MDP |
|---|---|---|
| Admin | admin@pkfokam.edu | Admin@2024 |
| Enseignant | enseignant@pkfokam.edu | Admin@2024 |
| Étudiant | etudiant@pkfokam.edu | Admin@2024 |

## Structure
```
src/app/
├── core/
│   ├── models/        # Interfaces TypeScript
│   ├── services/      # AuthService, NoteService, MoyenneService...
│   ├── interceptors/  # JWT interceptor
│   └── guards/        # AuthGuard + roleGuard
├── shared/components/
│   ├── layout/        # Shell principal
│   ├── sidebar/       # Navigation par rôle
│   └── header/        # En-tête utilisateur
└── features/
    ├── auth/          # Login
    ├── dashboard/     # KPIs + graphiques Chart.js
    ├── notes/         # Saisie batch + CSV + verrouillage
    ├── moyennes/      # Classement + relevé PDF + export Excel
    ├── etudiants/     # Liste + historique + relevé
    ├── referentiel/   # Filières/Promotions/Semestres/UE/Matières (Admin)
    └── utilisateurs/  # Gestion comptes (Admin)
```

import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES) },
  { path: '', canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'referentiel', loadComponent: () => import('./features/referentiel/referentiel.component').then(m => m.ReferentielComponent), canActivate: [roleGuard('ADMIN')] },
      { path: 'notes', loadComponent: () => import('./features/notes/notes.component').then(m => m.NotesComponent), canActivate: [roleGuard('ADMIN','ENSEIGNANT')] },
      { path: 'moyennes', loadComponent: () => import('./features/moyennes/moyennes.component').then(m => m.MoyennesComponent) },
      { path: 'etudiants', loadComponent: () => import('./features/etudiants/etudiants.component').then(m => m.EtudiantsComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./features/utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent), canActivate: [roleGuard('ADMIN')] },
      { path: 'statistiques', loadComponent: () => import('./features/statistiques/statistiques.component').then(m => m.StatistiquesComponent), canActivate: [roleGuard('ADMIN','ENSEIGNANT')] },
      { path: 'parametres', loadComponent: () => import('./features/parametres/parametres.component').then(m => m.ParametresComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

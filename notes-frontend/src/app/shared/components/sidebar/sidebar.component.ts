import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';

interface NavItem {
  icon: string;
  label: string;
  route?: string;
  fragment?: string;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  template: `
    @if (sidebarState.isOpen()) {
      <div class="sidebar-backdrop" (click)="sidebarState.close()"></div>
    }
    <aside class="sidebar" [class.open]="sidebarState.isOpen()">
      <div class="sidebar-header">
        <div class="brand">
          <span class="logo">🎓</span>
          <div><span class="name">PKFokam</span><span class="sub">{{brandSubtitle()}}</span></div>
        </div>
        <button class="sidebar-close-btn" (click)="sidebarState.close()">
          <i class="fas fa-xmark" style="font-size:20px"></i>
        </button>
      </div>
      <nav class="nav">
        <span class="section-label">Navigation</span>
        @for (item of visibleItems(); track item.label) {
          @if (item.fragment) {
            <a class="nav-item" (click)="onNavClick(); scrollTo(item.fragment)">
              <i class="{{item.icon}}" style="width:19px;text-align:center;font-size:15px"></i><span>{{item.label}}</span>
            </a>
          } @else {
            <a [routerLink]="item.route" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
              <i class="{{item.icon}}" style="width:19px;text-align:center;font-size:15px"></i><span>{{item.label}}</span>
            </a>
          }
        }
      </nav>
      <div class="footer">
        <div class="user-info">
          <div class="avatar">
            @if (photoUrl()) {
              <img [src]="photoUrl()" alt="Photo" class="avatar-img">
            } @else {
              {{initials()}}
            }
          </div>
          <div class="details">
            <span class="uname">{{user()?.prenom}} {{user()?.nom}}</span>
            <span class="badge sidebar-role" [class]="roleBadgeClass()">{{roleLabel()}}</span>
          </div>
        </div>
        <div class="footer-actions">
          <a class="footer-btn" routerLink="/parametres" matTooltip="Paramètres" (click)="onNavClick()">
            <i class="fas fa-gear"></i>
          </a>
          <button class="footer-btn" (click)="logout()" matTooltip="Déconnexion">
            <i class="fas fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:99; }
    .sidebar { width:var(--sidebar-w); height:100vh; background:var(--sidebar-bg, #1B3A6B); color:white; display:flex; flex-direction:column; position:fixed; left:0; top:0; z-index:100; box-shadow:4px 0 16px rgba(0,0,0,.15); transition:transform .25s ease; }
    .sidebar-header { display:flex; align-items:center; justify-content:space-between; padding:22px 18px; border-bottom:1px solid rgba(255,255,255,.1); }
    .brand { display:flex; align-items:center; gap:12px;
      .logo { font-size:28px; } .name { display:block; font-size:16px; font-weight:700; } .sub { display:block; font-size:11px; opacity:.55; } }
    .sidebar-close-btn { display:none; background:none; border:none; cursor:pointer; color:rgba(255,255,255,.6); width:32px; height:32px; border-radius:8px; align-items:center; justify-content:center; transition:all .15s;
      mat-icon { font-size:20px; width:20px; height:20px; }
      &:hover { background:rgba(255,255,255,.12); color:white; } }
    .nav { flex:1; padding:14px 10px; overflow-y:auto; }
    .section-label { display:block; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1px; color:rgba(255,255,255,.35); padding:6px 8px 4px; }
    .nav-item { display:flex; align-items:center; gap:11px; padding:9px 10px; border-radius:8px; color:rgba(255,255,255,.65); text-decoration:none; font-size:14px; font-weight:500; transition:all .15s; margin-bottom:2px; cursor:pointer;
      mat-icon { font-size:19px; width:19px; height:19px; }
      &:hover { background:rgba(255,255,255,.1); color:white; }
      &.active { background:rgba(255,255,255,.16); color:white; box-shadow:inset 3px 0 0 #0EA5E9; } }
    .footer { padding:10px 12px; border-top:1px solid rgba(255,255,255,.1); display:flex; flex-direction:column; gap:8px; }
    .user-info { display:flex; align-items:center; gap:10px; min-width:0; }
    .avatar { width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; flex-shrink:0; overflow:hidden; }
    .avatar-img { width:100%; height:100%; object-fit:cover; }
    .details { display:flex; flex-direction:column; min-width:0; flex:1; }
    .uname { font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sidebar-role { font-size:9px !important; padding:1px 6px !important; margin-top:2px; align-self:flex-start; }
    .footer-actions { display:flex; gap:4px; justify-content:flex-end; border-top:1px solid rgba(255,255,255,.08); padding-top:8px; }
    .footer-btn { background:none; border:none; cursor:pointer; color:rgba(255,255,255,.5); width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; transition:all .15s; text-decoration:none;
      mat-icon { font-size:18px; width:18px; height:18px; }
      &:hover { background:rgba(255,255,255,.12); color:white; } }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  sidebarState = inject(SidebarStateService);
  user = this.authService.currentUser;

  private nav: NavItem[] = [
    { icon:'fas fa-chart-pie',           label:'Tableau de bord',      route:'/dashboard' },
    { icon:'fas fa-graduation-cap',      label:'Étudiants',            route:'/etudiants',       roles:['ADMIN','ENSEIGNANT'] },
    { icon:'fas fa-pen-to-square',       label:'Saisie des notes',     route:'/notes',           roles:['ADMIN','ENSEIGNANT'] },
    { icon:'fas fa-calculator',          label:'Moyennes',             route:'/moyennes' },
    { icon:'fas fa-sitemap',             label:'Référentiel',          route:'/referentiel',     roles:['ADMIN'] },
    { icon:'fas fa-users-gear',          label:'Utilisateurs',         route:'/utilisateurs',    roles:['ADMIN'] },
    { icon:'fas fa-chart-simple',        label:'Statistiques',         route:'/statistiques',    roles:['ADMIN','ENSEIGNANT'] },
    { icon:'fas fa-chart-bar',           label:'Visualisation graphique', fragment:'student-charts', roles:['ETUDIANT'] },
    { icon:'fas fa-filter',              label:'Filtrage',               fragment:'student-filter',  roles:['ETUDIANT'] },
    { icon:'fas fa-gear',                label:'Paramètres',             route:'/parametres' },
  ];

  visibleItems = computed(() => {
    const role = this.user()?.role;
    return this.nav.filter(i => !i.roles || (role && i.roles.includes(role)));
  });

  brandSubtitle = computed(() => {
    const role = this.user()?.role;
    if (role === 'ADMIN')       return 'Dashboard Admin';
    if (role === 'ENSEIGNANT')  return 'Dashboard Enseignant';
    if (role === 'ETUDIANT')    return 'Dashboard Étudiant';
    return 'Notes';
  });

  initials   = computed(() => { const u=this.user(); return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '?'; });
  roleLabel  = computed(() => { const labels: Record<string, string> = { ADMIN:'Administrateur', ENSEIGNANT:'Enseignant', ETUDIANT:'Étudiant' }; return labels[this.user()?.role ?? ''] ?? ''; });
  photoUrl   = computed(() => { const u = this.user(); return u ? localStorage.getItem(`photo_${u.id}`) : null; });
  roleBadgeClass = computed(() => { const r = this.user()?.role; if (r === 'ADMIN') return 'admin'; if (r === 'ENSEIGNANT') return 'enseignant'; return 'etudiant'; });

  scrollTo(fragment: string): void {
    // Try direct scroll first (if already on dashboard)
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // Navigate to dashboard then scroll
    this.router.navigate(['/dashboard']).then(() => {
      setTimeout(() => {
        document.getElementById(fragment)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  }

  onNavClick(): void {
    if (window.innerWidth <= 768) {
      this.sidebarState.close();
    }
  }

  logout() { this.authService.logout(); }
}

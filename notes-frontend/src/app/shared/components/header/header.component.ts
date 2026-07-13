import { Component, computed, inject, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarStateService } from '../../../core/services/sidebar-state.service';

interface NotificationItem {
  id: string;
  lue: boolean;
  icone: string;
  message: string;
  date: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule],
  template: `
    <header class="header">
      <div class="header-left">
        <button class="hamburger-btn" (click)="sidebarState.toggle()" matTooltip="Menu">
          <mat-icon>{{sidebarState.isOpen() ? 'close' : 'menu'}}</mat-icon>
        </button>
        <span class="header-title">Gestion des Notes — PKFokam Institute</span>
      </div>
      <div class="header-right">
        <!-- Dark Mode Toggle -->
        <button mat-icon-button (click)="toggleTheme()" [matTooltip]="isDark() ? 'Mode clair' : 'Mode sombre'" class="header-btn theme-btn">
          <mat-icon>{{isDark() ? 'light_mode' : 'dark_mode'}}</mat-icon>
        </button>

        <!-- Bouton Notification -->
        <button mat-icon-button [matBadge]="notifCount()" matBadgeSize="small" matBadgeColor="warn"
                [matMenuTriggerFor]="notifMenu" matTooltip="Notifications" class="header-btn notif-btn">
          <mat-icon>notifications</mat-icon>
        </button>
        <mat-menu #notifMenu>
          <div class="notif-panel">
            <div class="notif-header">
              Notifications
              <span class="notif-count-label">{{notifCount()}} non lues</span>
            </div>
            @for (n of notifications(); track n.id) {
              <div class="notif-item" [class.unread]="!n.lue">
                <mat-icon class="notif-item-icon">{{n.icone}}</mat-icon>
                <div style="flex:1">
                  <p style="margin:0;font-size:12px;font-weight:500">{{n.message}}</p>
                  <span class="notif-date">{{n.date}}</span>
                </div>
              </div>
            }
            @if (notifications().length === 0) {
              <div class="notif-empty">
                <mat-icon class="notif-empty-icon">notifications_off</mat-icon>
                <p style="margin:0">Aucune notification</p>
              </div>
            }
          </div>
        </mat-menu>

        <!-- Icône Paramètre avec infos utilisateur -->
        <button mat-icon-button [matMenuTriggerFor]="settingsMenu" matTooltip="Paramètres" class="header-btn settings-btn">
          <mat-icon>settings</mat-icon>
        </button>
        <mat-menu #settingsMenu>
          <div class="settings-panel">
            <div class="settings-user-header">
              <div class="h-avatar-lg">
                @if (photoUrl()) {
                  <img [src]="photoUrl()" alt="Photo profil" class="profile-photo">
                } @else {
                  {{initials()}}
                }
              </div>
              <div>
                <p style="font-weight:700;font-size:14px;margin:0">{{user()?.prenom}} {{user()?.nom}}</p>
                <span class="badge" [class]="roleBadgeClass()" style="margin-top:2px">{{roleLabel()}}</span>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
              <div class="info-row"><mat-icon>email</mat-icon><span>{{user()?.email}}</span></div>
              @if (user()?.telephone) {
                <div class="info-row"><mat-icon>phone</mat-icon><span>{{user()?.telephone}}</span></div>
              }
              @if (user()?.adresse) {
                <div class="info-row"><mat-icon>location_on</mat-icon><span>{{user()?.adresse}}</span></div>
              }
              @if (user()?.numeroEtudiant) {
                <div class="info-row"><mat-icon>badge</mat-icon><span>{{user()?.numeroEtudiant}}</span></div>
              }
              @if (user()?.specialite) {
                <div class="info-row"><mat-icon>school</mat-icon><span>{{user()?.specialite}} — {{user()?.grade}}</span></div>
              }
            </div>
            <div class="settings-actions">
              <button mat-menu-item (click)="scrollToProfil()">
                <mat-icon>person</mat-icon> Mon profil
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon> Déconnexion
              </button>
            </div>
          </div>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .header { height:var(--header-h); background:white; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 24px; box-shadow:var(--shadow); position:sticky; top:0; z-index:50; }
    .header-left { display:flex; align-items:center; gap:8px; min-width:0; }
    .hamburger-btn { display:none; background:none; border:none; cursor:pointer; color:var(--muted); width:36px; height:36px; border-radius:8px; align-items:center; justify-content:center; transition:all .15s; flex-shrink:0;
      mat-icon { font-size:22px; width:22px; height:22px; }
      &:hover { background:var(--bg); color:var(--text); } }
    .header-title { font-size:16px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .header-right { display:flex; align-items:center; gap:4px; flex-shrink:0; }
    .header-btn { border-radius:10px !important; transition:all .2s; }
    .notif-btn { color:#64748B !important; &:hover { background:#F0F9FF !important; color:#0EA5E9 !important; } }
    .settings-btn { color:#64748B !important; &:hover { background:#F5F3FF !important; color:#7C3AED !important; } }
    .theme-btn { color:#64748B !important; &:hover { background:#F0FDF4 !important; color:#10B981 !important; } }
    .h-avatar-lg { width:42px; height:42px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; flex-shrink:0; overflow:hidden; }
    .profile-photo { width:100%; height:100%; object-fit:cover; }
    .notif-panel { min-width:280px; max-height:300px; overflow-y:auto; }
    .notif-header { padding:12px 16px; border-bottom:1px solid var(--border); font-weight:600; font-size:13px; color:var(--text); }
    .notif-count-label { float:right; font-size:11px; color:var(--muted); font-weight:400; }
    .notif-item { display:flex; align-items:flex-start; gap:10px; padding:10px 16px; cursor:pointer; border-bottom:1px solid var(--border); color:var(--text); font-size:12px; &:hover { background:var(--bg); } &.unread { background:var(--primary-pale); } &:last-child { border:none; } }
    .notif-item-icon { font-size:18px; width:18px; height:18px; flex-shrink:0; color:var(--muted); }
    .notif-date { font-size:10px; color:var(--muted); }
    .notif-empty { padding:24px; text-align:center; color:var(--muted); font-size:13px; }
    .notif-empty-icon { font-size:36px; width:36px; height:36px; margin-bottom:8px; }
    .settings-panel { padding:16px; min-width:280px; }
    .settings-user-header { display:flex; align-items:center; gap:12px; margin-bottom:12px; border-bottom:1px solid var(--border); padding-bottom:12px; }
    .settings-actions { border-top:1px solid var(--border); padding-top:8px; }
    .info-row { display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text); mat-icon { font-size:18px; width:18px; height:18px; color:var(--muted); flex-shrink:0; } span { flex:1; word-break:break-all; } }
  `]
})
export class HeaderComponent {
  private auth = inject(AuthService);
  sidebarState = inject(SidebarStateService);
  user     = this.auth.currentUser;

  // ── Dark Mode ────────────────────────────────────────────────────────
  isDark = signal(localStorage.getItem('theme') === 'dark');

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    // Add transition class for smooth theme switch
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => document.documentElement.classList.remove('theme-transition'), 400);
  }

  constructor() {
    // Apply saved theme on init
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  initials = computed(() => {
    const u = this.user();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : '?';
  });

  roleLabel = computed(() => {
    const labels: Record<string, string> = { ADMIN:'Administrateur', ENSEIGNANT:'Enseignant', ETUDIANT:'Étudiant' };
    return labels[this.user()?.role ?? ''] ?? '';
  });

  roleBadgeClass = computed(() => {
    const r = this.user()?.role;
    if (r === 'ADMIN') return 'admin';
    if (r === 'ENSEIGNANT') return 'enseignant';
    return 'etudiant';
  });

  // Photo de profil depuis localStorage
  photoUrl = computed(() => {
    const u = this.user();
    return u ? localStorage.getItem(`photo_${u.id}`) : null;
  });

  // Notifications (seront alimentées par le backend plus tard)
  notifications = signal<NotificationItem[]>([]);

  notifCount = computed(() => this.notifications().filter(n => !n.lue).length);

  private router = inject(Router);

  scrollToProfil(): void {
    const el = document.getElementById('section-profil');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      this.router.navigate(['/dashboard']).then(() => {
        setTimeout(() => {
          document.getElementById('section-profil')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    }
  }

  logout() { this.auth.logout(); }
}

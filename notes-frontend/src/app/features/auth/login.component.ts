import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
            MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-page">
      <div class="login-left">
        <div class="login-left-content">
          <div class="brand">
            <span class="brand-icon">🎓</span>
            <h1>PKFokam Institute</h1>
            <p>Système de Gestion des Notes Étudiantes</p>
          </div>
          <div class="features">
            <div class="feature" *ngFor="let f of features">
              <span>{{f.icon}}</span>
              <div><strong>{{f.title}}</strong><p>{{f.desc}}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-box">
          <div class="login-box-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace académique</p>
          </div>

          <!-- Sélecteur de rôle -->
          <div class="role-selector">
            @for (r of roles; track r.value) {
              <button type="button" class="role-card" [class.active]="selectedRole() === r.value"
                      (click)="selectRole(r.value)">
                <span class="role-icon">{{r.icon}}</span>
                <div class="role-info">
                  <strong>{{r.label}}</strong>
                  <span class="role-desc">{{r.description}}</span>
                </div>
                <span class="role-check">
                  <mat-icon>{{selectedRole() === r.value ? 'radio_button_checked' : 'radio_button_unchecked'}}</mat-icon>
                </span>
              </button>
            }
          </div>

          @if (selectedRole()) {
            <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
              <mat-form-field appearance="outline" style="width:100%">
                <mat-label>Email</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput formControlName="email" type="email">
                <mat-error>Email invalide</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" style="width:100%;margin-top:8px">
                <mat-label>Mot de passe</mat-label>
                <mat-icon matPrefix>lock</mat-icon>
                <input matInput formControlName="motDePasse" [type]="showPwd() ? 'text' : 'password'">
                <button mat-icon-button matSuffix type="button" (click)="showPwd.set(!showPwd())">
                  <mat-icon>{{showPwd() ? 'visibility_off' : 'visibility'}}</mat-icon>
                </button>
              </mat-form-field>

              @if (error()) {
                <div class="error-box"><mat-icon>error_outline</mat-icon> {{error()}}</div>
              }

              <button mat-raised-button type="submit" [disabled]="form.invalid || loading()"
                      class="login-submit-btn">
                @if (loading()) { <mat-spinner diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner> }
                <mat-icon>login</mat-icon>
                Se connecter comme {{selectedRoleLabel()}}
              </button>
            </form>
          } @else {
            <div class="select-role-hint">
              <mat-icon>touch_app</mat-icon>
              <span>Sélectionnez votre profil ci-dessus pour vous connecter</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page { display:flex; min-height:100vh; }
    .login-left { flex:1; background:url('/assets/images/etudiant.avif') center/cover no-repeat; color:white; display:flex; flex-direction:row; align-items:center; overflow:hidden; position:relative; }
    .login-left::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(15,23,42,.85) 0%,rgba(30,58,95,.75) 100%); z-index:1; }
    .brand { margin-bottom:48px; .brand-icon { font-size:52px; display:block; margin-bottom:16px; } h1 { font-size:30px; font-weight:700; margin-bottom:8px; } p { opacity:.9; font-size:15px; } }
    .features { display:flex; flex-direction:column; gap:22px; }
    .feature { display:flex; align-items:flex-start; gap:14px; span { font-size:26px; flex-shrink:0; } strong { display:block; font-size:15px; margin-bottom:3px; } p { opacity:.85; font-size:13px; } }
    .login-left-content { flex:1; padding:60px 40px 60px 60px; display:flex; flex-direction:column; justify-content:center; position:relative; z-index:2; }
    .login-right { flex:1; display:flex; align-items:center; justify-content:center; background:#F8FAFC; padding:40px; }
    .login-box { width:100%; max-width:440px; background:white; border-radius:16px; padding:36px; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .login-box-header { text-align:center; margin-bottom:24px; h2 { font-size:22px; font-weight:700; color:#1E293B; margin-bottom:6px; } p { color:#64748B; font-size:13px; } }

    /* Sélecteur de rôle */
    .role-selector { display:flex; flex-direction:column; gap:8px; margin-bottom:20px; }
    .role-card { display:flex; align-items:center; gap:12px; width:100%; padding:14px 16px; border:2px solid #E2E8F0; border-radius:12px; background:white; cursor:pointer; transition:all .2s; text-align:left; }
    .role-card:hover { border-color:#94A3B8; background:#F8FAFC; }
    .role-card.active { border-color:#1B3A6B; background:#EFF6FF; box-shadow:0 0 0 1px #1B3A6B; }
    .role-icon { font-size:28px; line-height:1; flex-shrink:0; }
    .role-info { flex:1; display:flex; flex-direction:column; gap:2px; }
    .role-info strong { font-size:14px; color:#1E293B; }
    .role-desc { font-size:11px; color:#94A3B8; }
    .role-check { flex-shrink:0; mat-icon { font-size:20px; color:#CBD5E1; } }
    .role-card.active .role-check mat-icon { color:#1B3A6B; }

    .login-form { animation:fadeSlideIn .3s ease; }
    @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

    .login-submit-btn { width:100%; height:48px; font-size:14px; font-weight:600; background:#1B3A6B !important; color:white !important; margin-top:16px; display:flex; align-items:center; justify-content:center; gap:8px; }

    .select-role-hint { display:flex; flex-direction:column; align-items:center; gap:8px; padding:28px; color:#94A3B8; font-size:13px; text-align:center;
      mat-icon { font-size:36px; width:36px; height:36px; opacity:.5; } }

    .error-box { display:flex; align-items:center; gap:8px; background:#FEF2F2; color:#EF4444; border:1px solid #FCA5A5; border-radius:8px; padding:10px 14px; font-size:13px; margin-top:8px; mat-icon { font-size:18px; height:18px; width:18px; } }
    @media(max-width:768px) { .login-left { display:none; } .login-right { width:100%; padding:24px; } }
  `]
})
export class LoginComponent {
  private fb   = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  selectedRole = signal<string | null>(null);
  form     = this.fb.group({ email: ['', [Validators.required, Validators.email]], motDePasse: ['', Validators.required] });
  loading  = signal(false);
  showPwd  = signal(false);
  error    = signal('');

  roles = [
    { value: 'ADMIN',      icon: '',  label: 'Administrateur',    description: 'Gestion complète du système' },
    { value: 'ENSEIGNANT', icon: '', label: 'Enseignant',        description: 'Saisie des notes et suivi' },
    { value: 'ETUDIANT',   icon: '',  label: 'Étudiant',          description: 'Consultation des notes et relevés' },
  ];

  selectedRoleLabel = computed(() => this.roles.find(r => r.value === this.selectedRole())?.label ?? '');

  selectRole(role: string): void {
    this.selectedRole.set(role);
    this.error.set('');
  }

  features = [
    { icon: '📊', title: 'Saisie des notes',       desc: 'Saisie individuelle, par lot et import CSV' },
    { icon: '🧮', title: 'Calcul automatique',     desc: 'Moyennes pondérées, mentions et classements' },
    { icon: '📄', title: 'Relevés PDF officiels',  desc: 'Génération automatique des bulletins' },
    { icon: '📈', title: 'Statistiques avancées',  desc: 'Distribution, taux de réussite par filière' },
  ];

  submit() {
    if (this.form.invalid || !this.selectedRole()) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error.set(e.error?.message || 'Email ou mot de passe incorrect'); this.loading.set(false); }
    });
  }
}

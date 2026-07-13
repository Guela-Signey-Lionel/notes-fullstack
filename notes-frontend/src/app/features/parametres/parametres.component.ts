import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <div>
          <h1>Paramètres</h1>
          <p>Gérez vos informations personnelles</p>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Photo de profil -->
        <div class="card">
          <div class="card-header"><h2>Photo de profil</h2></div>
          <div class="photo-section">
            <div class="photo-preview">
              <div class="photo-frame">
                @if (photoUrl()) {
                  <img [src]="photoUrl()" alt="Photo" class="preview-img">
                } @else {
                  <span class="preview-initials">{{initials()}}</span>
                }
              </div>
              <div class="photo-actions">
                <button mat-raised-button color="primary" (click)="fileInput.click()" [disabled]="uploading()">
                  <mat-icon>camera_alt</mat-icon> Choisir une photo
                </button>
                @if (photoUrl()) {
                  <button mat-stroked-button color="warn" (click)="removePhoto()">
                    <mat-icon>delete</mat-icon> Supprimer
                  </button>
                }
                <input #fileInput type="file" accept="image/*" hidden (change)="onPhotoSelected($event)">
              </div>
            </div>
            @if (uploading()) {
              <div class="progress-section">
                <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
                <span class="progress-text">{{uploadProgress()}}% — Traitement en cours...</span>
              </div>
            }
          </div>
        </div>

        <!-- Informations personnelles -->
        <div class="card">
          <div class="card-header"><h2>Informations personnelles</h2></div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">Nom complet</span>
              <span class="info-value">{{user()?.prenom}} {{user()?.nom}}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{user()?.email}}</span>
            </div>
            @if (user()?.telephone) {
              <div class="info-item">
                <span class="info-label">Téléphone</span>
                <span class="info-value">{{user()?.telephone}}</span>
              </div>
            }
            @if (user()?.adresse) {
              <div class="info-item">
                <span class="info-label">Adresse</span>
                <span class="info-value">{{user()?.adresse}}</span>
              </div>
            }
            @if (user()?.numeroEtudiant) {
              <div class="info-item">
                <span class="info-label">N° Étudiant</span>
                <span class="info-value">{{user()?.numeroEtudiant}}</span>
              </div>
            }
            @if (user()?.specialite) {
              <div class="info-item">
                <span class="info-label">Spécialité</span>
                <span class="info-value">{{user()?.specialite}}</span>
              </div>
            }
            @if (user()?.grade) {
              <div class="info-item">
                <span class="info-label">Grade</span>
                <span class="info-value">{{user()?.grade}}</span>
              </div>
            }
            <div class="info-item">
              <span class="info-label">Rôle</span>
              <span class="badge" [class]="roleBadgeClass()">{{roleLabel()}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
    .photo-section { display:flex; flex-direction:column; align-items:center; gap:16px; }
    .photo-preview { display:flex; flex-direction:column; align-items:center; gap:16px; }
    .photo-frame { width:140px; height:140px; border-radius:50%; background:linear-gradient(135deg,#1B3A6B,#2563EB); display:flex; align-items:center; justify-content:center; overflow:hidden; border:4px solid #E2E8F0; box-shadow:0 4px 16px rgba(0,0,0,.1); }
    .preview-img { width:100%; height:100%; object-fit:cover; }
    .preview-initials { font-size:48px; font-weight:700; color:white; }
    .photo-actions { display:flex; gap:8px; }
    .progress-section { width:100%; max-width:300px; }
    .progress-text { display:block; text-align:center; font-size:11px; color:var(--muted); margin-top:4px; }
    .info-list { display:flex; flex-direction:column; gap:12px; }
    .info-item { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F1F5F9; &:last-child { border:none; } }
    .info-label { font-size:13px; color:var(--muted); font-weight:500; }
    .info-value { font-size:14px; color:var(--text); font-weight:600; }
    @media(max-width:768px) { .settings-grid { grid-template-columns:1fr; } }
  `]
})
export class ParametresComponent {
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  user    = this.auth.currentUser;
  uploading = signal(false);
  uploadProgress = signal(0);

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

  photoUrl = computed(() => {
    const u = this.user();
    return u ? localStorage.getItem(`photo_${u.id}`) : null;
  });

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.snack.open('Format d\'image non supporté', 'OK', { duration: 3000, panelClass: 'error-snack' });
      return;
    }

    this.uploading.set(true);
    this.uploadProgress.set(0);

    const reader = new FileReader();

    // Simuler la progression
    const interval = setInterval(() => {
      this.uploadProgress.update(v => Math.min(v + 10, 90));
    }, 200);

    reader.onload = () => {
      clearInterval(interval);
      this.uploadProgress.set(100);

      setTimeout(() => {
        const dataUrl = reader.result as string;
        const u = this.user();
        if (u) {
          localStorage.setItem(`photo_${u.id}`, dataUrl);
          const updated = { ...u };
          this.auth.currentUser.set(updated);
        }
        this.uploading.set(false);
        this.uploadProgress.set(0);
        this.snack.open('Photo de profil mise à jour', 'OK', { duration: 2000, panelClass: 'success-snack' });
      }, 300);
    };

    reader.onerror = () => {
      clearInterval(interval);
      this.uploading.set(false);
      this.uploadProgress.set(0);
      this.snack.open('Erreur lors du chargement de l\'image', 'OK', { duration: 3000, panelClass: 'error-snack' });
    };

    reader.readAsDataURL(file);
  }

  removePhoto(): void {
    const u = this.user();
    if (!u) return;
    localStorage.removeItem(`photo_${u.id}`);
    const updated = { ...u };
    this.auth.currentUser.set(updated);
    this.snack.open('Photo de profil supprimée', 'OK', { duration: 2000, panelClass: 'info-snack' });
  }
}

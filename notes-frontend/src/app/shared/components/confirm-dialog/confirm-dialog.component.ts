import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-wrapper">
      <div class="dialog-icon">
        <i class="fas fa-trash" style="font-size:48px;width:48px;height:48px;color:#EF4444"></i>
      </div>
      <h2 mat-dialog-title>{{data.titre || 'Confirmation'}}</h2>
      <mat-dialog-content>
        <p>{{data.message}}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="dialogRef.close(false)">Annuler</button>
        <button mat-raised-button color="warn" (click)="dialogRef.close(true)">
          <i class="fas fa-trash-alt"></i> {{data.btnConfirmer || 'Confirmer'}}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-wrapper { padding:8px; text-align:center; }
    .dialog-icon { margin-bottom:8px; mat-icon { font-size:48px; width:48px; height:48px; color:#EF4444; } }
    h2 { margin:0 0 8px; font-size:18px; font-weight:700; }
    p { color:#64748B; font-size:14px; margin:0; }
    mat-dialog-actions { padding:16px 0 0 !important; gap:8px; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { titre: string; message: string; btnConfirmer: string }
  ) {}
}

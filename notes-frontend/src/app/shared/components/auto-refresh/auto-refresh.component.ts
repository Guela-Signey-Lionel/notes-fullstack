import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CacheService } from '../../../core/services/cache.service';

@Component({
  selector: 'app-auto-refresh',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="refresh-bar">
      <span class="refresh-info">
        @if (cacheSvc.isRefreshing()) {
          <mat-spinner diameter="14" style="display:inline-block;margin-right:4px"></mat-spinner>
        } @else {
          <i class="fas fa-check-circle" style="color:var(--success);font-size:12px;margin-right:4px"></i>
        }
        <span style="font-size:11px;color:var(--muted)">
          @if (cacheSvc.lastRefresh()) {
            Dernière mise à jour : {{cacheSvc.timeSinceLastRefresh()}}
          }
        </span>
      </span>
      <div style="display:flex;gap:4px">
        @if (autoRefresh()) {
          <span class="badge active" style="font-size:9px;cursor:default" matTooltip="Rechargement auto toutes les minutes">
            <i class="fas fa-sync-alt" style="font-size:9px;margin-right:2px"></i> Auto
          </span>
        }
        <button mat-icon-button style="width:24px;height:24px" (click)="onRefresh.emit()"
                [disabled]="cacheSvc.isRefreshing()" matTooltip="Recharger maintenant">
          <i class="fas fa-rotate" [class.fa-spin]="cacheSvc.isRefreshing()" style="font-size:11px"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .refresh-bar { display:flex; align-items:center; justify-content:space-between; padding:6px 12px; background:var(--bg); border-radius:8px; border:1px solid var(--border); margin-bottom:16px; }
    .refresh-info { display:flex; align-items:center; gap:4px; }
  `]
})
export class AutoRefreshComponent {
  cacheSvc = inject(CacheService);
  autoRefresh = input(false);
  onRefresh = output<void>();
}

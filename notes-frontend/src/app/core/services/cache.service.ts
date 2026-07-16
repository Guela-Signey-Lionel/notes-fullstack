import { Injectable, OnDestroy, signal } from '@angular/core';
import { Observable, of, timer, Subscription, switchMap, tap, catchError } from 'rxjs';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService implements OnDestroy {
  private cache = new Map<string, CacheEntry<any>>();
  private refreshSubscriptions = new Map<string, Subscription>();
  private readonly DEFAULT_TTL = 120_000; // 2 minutes
  private readonly DEFAULT_REFRESH_INTERVAL = 60_000; // 1 minute

  isRefreshing = signal(false);
  lastRefresh = signal<Date | null>(null);

  /**
   * Récupère une donnée avec cache et rechargement automatique.
   * Si la donnée est en cache et encore valide, retourne le cache.
   * Sinon, appelle la fonction de fetch.
   */
  get<T>(
    key: string,
    fetchFn: () => Observable<T>,
    ttlMs: number = this.DEFAULT_TTL
  ): Observable<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < ttlMs) {
      return of(cached.data);
    }
    return fetchFn().pipe(
      tap(data => this.set(key, data)),
      catchError(err => {
        if (cached) return of(cached.data); // fallback to stale cache on error
        throw err;
      })
    );
  }

  set<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
    this.stopAllRefresh();
  }

  /**
   * Démarre le rechargement automatique à intervalle régulier.
   * Exemple : startAutoRefresh('stats', () => this.http.get(...), 60000)
   */
  startAutoRefresh<T>(
    key: string,
    fetchFn: () => Observable<T>,
    intervalMs: number = this.DEFAULT_REFRESH_INTERVAL
  ): void {
    this.stopAutoRefresh(key);
    const sub = timer(intervalMs, intervalMs).pipe(
      switchMap(() => {
        this.isRefreshing.set(true);
        return fetchFn().pipe(
          tap(data => {
            this.set(key, data);
            this.lastRefresh.set(new Date());
            this.isRefreshing.set(false);
          }),
          catchError(err => {
            this.isRefreshing.set(false);
            return of(null);
          })
        );
      })
    ).subscribe();
    this.refreshSubscriptions.set(key, sub);
  }

  stopAutoRefresh(key: string): void {
    const sub = this.refreshSubscriptions.get(key);
    if (sub && !sub.closed) {
      sub.unsubscribe();
    }
    this.refreshSubscriptions.delete(key);
  }

  stopAllRefresh(): void {
    this.refreshSubscriptions.forEach(sub => {
      if (!sub.closed) sub.unsubscribe();
    });
    this.refreshSubscriptions.clear();
  }

  ngOnDestroy(): void {
    this.stopAllRefresh();
  }

  /** Formate le temps depuis le dernier refresh */
  timeSinceLastRefresh(): string {
    const last = this.lastRefresh();
    if (!last) return 'jamais';
    const diff = Date.now() - last.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `il y a ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `il y a ${minutes}min`;
    return `il y a ${Math.floor(minutes / 60)}h`;
  }
}

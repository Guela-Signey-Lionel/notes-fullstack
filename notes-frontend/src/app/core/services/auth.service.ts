import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, Utilisateur } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = `${environment.apiUrl}/auth`;
  currentUser = signal<Utilisateur | null>(this.fromStorage());
  constructor(private http: HttpClient, private router: Router) {}
  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(r => { localStorage.setItem('at', r.accessToken); localStorage.setItem('rt', r.refreshToken); localStorage.setItem('user', JSON.stringify(r.utilisateur)); this.currentUser.set(r.utilisateur); }));
  }
  logout(): void { this.http.post(`${this.API}/logout`,{}).subscribe(); localStorage.clear(); this.currentUser.set(null); this.router.navigate(['/auth/login']); }
  refreshToken(): Observable<AuthResponse> { return this.http.post<AuthResponse>(`${this.API}/refresh`, { refreshToken: localStorage.getItem('rt') }).pipe(tap(r => { localStorage.setItem('at', r.accessToken); localStorage.setItem('rt', r.refreshToken); })); }
  getToken() { return localStorage.getItem('at'); }
  isLoggedIn() { return !!this.getToken() && !!this.currentUser(); }
  hasRole(...roles: string[]) { const u = this.currentUser(); return u ? roles.includes(u.role) : false; }
  private fromStorage(): Utilisateur | null { try { const r = localStorage.getItem('user'); return r ? JSON.parse(r) : null; } catch { return null; } }
}

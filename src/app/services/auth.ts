import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Admin } from '../models/admin';
import { Observable, switchMap, tap, from, catchError, throwError } from 'rxjs';

type CurrentUser = Admin;

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseAdmins = 'http://localhost:3000/admins';

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  user = signal<CurrentUser | null>(null);
  userType = signal<'admin' | null>(null);

  constructor(private http: HttpClient) {
    // Charger uniquement côté navigateur
    if (this.isBrowser) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const raw = localStorage.getItem('auth_user');
      const type = localStorage.getItem('auth_type');
      if (raw && type) {
        this.user.set(JSON.parse(raw));
        this.userType.set(type as 'admin');
      }
    } catch (error) {
      console.warn('Failed to load auth from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(user: CurrentUser, type: 'admin') {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_type', type);
    } catch (error) {
      console.warn('Failed to save auth to storage:', error);
    }
  }

  private clearStorage() {
    if (!this.isBrowser) return;

    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_type');
    } catch (error) {
      console.warn('Failed to clear auth storage:', error);
    }
  }

  login(username: string, password: string): Observable<CurrentUser> {
    return this.http
      .get<CurrentUser[]>(`${this.baseAdmins}?username=${encodeURIComponent(username)}`)
      .pipe(
        switchMap((list: CurrentUser[]) => {
          if (!Array.isArray(list) || list.length === 0) {
            return throwError(() => new Error('Utilisateur non trouvé'));
          }

          const u = list[0];

          if (password !== u.password) {
            return throwError(() => new Error('Mot de passe incorrect'));
          }

          const updatedUser: CurrentUser = {
            ...u,
            dernierLogin: new Date().toISOString(),
          };

          this.user.set(updatedUser);
          this.userType.set('admin');
          this.saveToStorage(updatedUser, 'admin');

          // Mise à jour du dernierLogin dans la base
          this.http.put(`${this.baseAdmins}/${u.id}`, updatedUser).subscribe({
            next: () => {},
            error: (err) => console.warn('Erreur update JSON-server', err),
          });

          return from(Promise.resolve(updatedUser));
        })
      );
  }

  logout(): void {
    this.user.set(null);
    this.userType.set(null);
    this.clearStorage();
  }

  isAuthenticated(): boolean {
    return !!this.user();
  }

  isAdmin(): boolean {
    return this.userType() === 'admin';
  }

  getUser(): CurrentUser | null {
    return this.user();
  }

  getUserType(): 'admin' | null {
    return this.userType();
  }

  changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseAdmins}/${userId}`).pipe(
      switchMap((u) => {
        if (!u) {
          return throwError(() => new Error('Utilisateur introuvable'));
        }

        if (oldPassword !== u.password) {
          return throwError(() => new Error('Ancien mot de passe incorrect'));
        }

        const updated: CurrentUser = {
          ...u,
          password: newPassword,
          dernierLogin: new Date().toISOString(),
        };

        return this.http.put<CurrentUser>(`${this.baseAdmins}/${userId}`, updated).pipe(
          tap((result) => {
            this.user.set(result);
            this.saveToStorage(result, 'admin');
          })
        );
      }),
      catchError((error) => {
        console.error('Change password error:', error);
        return throwError(() => error);
      })
    );
  }
}

import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UtilisateurAdmin } from '../models/utilisateur-admin.model';
import { Utilisateur } from '../models/utilisateur';
import { Observable, switchMap, tap, from, catchError, throwError } from 'rxjs';

type CurrentUser = UtilisateurAdmin | Utilisateur;

@Injectable({
  providedIn: 'root'
})

export class Auth {
  private baseAdmins = 'http://localhost:3000/admins';
  private baseUsers = 'http://localhost:3000/users';

  user = signal<CurrentUser | null>(null);
  userType = signal<'admin' | 'user' | null>(null);

  constructor(private http: HttpClient) {
    const raw = localStorage.getItem('auth_user');
    const type = localStorage.getItem('auth_type');
    if (raw && type) {
      try {
        this.user.set(JSON.parse(raw));
        this.userType.set(type as 'admin' | 'user');
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_type');
      }
    }
  }

  login(username: string, password: string, isAdmin: boolean = false): Observable<CurrentUser> {
    const baseUrl = isAdmin ? this.baseAdmins : this.baseUsers;

    return this.http
      .get<CurrentUser[]>(`${baseUrl}?username=${encodeURIComponent(username)}`)
      .pipe(
        switchMap((list: CurrentUser[]) => {
          if (!Array.isArray(list) || list.length === 0) {
            throw new Error('Utilisateur non trouvé');
          }

          const u = list[0];

          if (password !== u.password) {
            throw new Error('Mot de passe incorrect');
          }

          if (!u.isActive) {
            throw new Error('Compte désactivé');
          }

          const updatedUser: CurrentUser = {
            ...u,
            dernierLogin: new Date().toISOString()
          };

          this.user.set(updatedUser);
          this.userType.set(isAdmin ? 'admin' : 'user');
          localStorage.setItem('auth_user', JSON.stringify(updatedUser));
          localStorage.setItem('auth_type', isAdmin ? 'admin' : 'user');

          this.http.put(`${baseUrl}/${u.id}`, updatedUser).subscribe({
            next: () => {},
            error: (err) => console.warn("Erreur update JSON-server", err)
          });

          return from(Promise.resolve(updatedUser));
        })
      );
  }

  register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    phone?: string;
  }): Observable<Utilisateur> {
    console.log('Register called with:', data);

    return this.http.get<Utilisateur[]>(`${this.baseUsers}?username=${encodeURIComponent(data.username)}`).pipe(
      switchMap((existing) => {
        console.log('Checking username, found:', existing);
        if (existing.length > 0) {
          return throwError(() => new Error('Ce nom d\'utilisateur existe déjà'));
        }

        return this.http.get<Utilisateur[]>(`${this.baseUsers}?email=${encodeURIComponent(data.email)}`);
      }),
      switchMap((existing) => {
        console.log('Checking email, found:', existing);
        if (existing.length > 0) {
          return throwError(() => new Error('Cet email est déjà utilisé'));
        }

        const newUser: Partial<Utilisateur> = {
          username: data.username,
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          phone: data.phone || '',
          avatar: `https://i.pravatar.cc/150?u=${data.username}`,
          dateCreated: new Date().toISOString(),
          dernierLogin: null,
          isActive: true,
          favorites: []
        };

        console.log('Creating new user:', newUser);
        return this.http.post<Utilisateur>(this.baseUsers, newUser);
      }),
      tap(result => console.log('User created successfully:', result)),
      catchError(err => {
        console.error('Registration error:', err);
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    this.user.set(null);
    this.userType.set(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_type');
  }

  isAuthenticated(): boolean {
    return !!this.user();
  }

  isAdmin(): boolean {
    return this.userType() === 'admin';
  }

  isUser(): boolean {
    return this.userType() === 'user';
  }

  getUser(): CurrentUser | null {
    return this.user();
  }

  getUserType(): 'admin' | 'user' | null {
    return this.userType();
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): Observable<CurrentUser> {
    const baseUrl = this.isAdmin() ? this.baseAdmins : this.baseUsers;

    return this.http.get<CurrentUser>(`${baseUrl}/${userId}`).pipe(
      switchMap((u) => {
        if (!u) throw new Error('Utilisateur introuvable');

        if (oldPassword !== u.password) {
          throw new Error('Ancien mot de passe incorrect');
        }

        const updated: CurrentUser = {
          ...u,
          password: newPassword,
          dernierLogin: new Date().toISOString()
        };

        return this.http.put<CurrentUser>(`${baseUrl}/${userId}`, updated).pipe(
          tap(result => {
            this.user.set(result);
            localStorage.setItem('auth_user', JSON.stringify(result));
          })
        );
      })
    );
  }
}

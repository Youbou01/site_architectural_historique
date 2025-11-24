import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../../../models/admin';

@Injectable({
  providedIn: 'root',
})
export class UserManagement {
  private base = 'http://localhost:3000/admins';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.base);
  }

  getUser(id: string): Observable<Admin> {
    return this.http.get<Admin>(`${this.base}/${id}`);
  }

  createUser(user: Partial<Admin>): Observable<Admin> {
    const newUser = {
      ...user,
      dateCreated: new Date().toISOString(),
      dernierLogin: null,
      isActive: true,
    };
    return this.http.post<Admin>(this.base, newUser);
  }

  updateUser(user: Admin): Observable<Admin> {
    return this.http.put<Admin>(`${this.base}/${user.id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  
}



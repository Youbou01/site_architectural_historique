import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  dateCreated: string;
  dernierLogin: string | null;
  isActive: boolean;
  role?: string;
  type: 'admin' | 'user';
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];

  showForm = false;
  editingId: string | null = null;
  searchTerm = '';
  filterRole = '';
  filterStatus = '';

  formData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
    avatar: string;
    phone: string;
  } = {
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'user',
    avatar: '',
    phone: ''
  };

  private baseAdmins = 'http://localhost:3000/admins';
  private baseUsers = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    // Only load admins
    this.http.get<User[]>(this.baseAdmins).subscribe({
      next: (admins) => {
        this.allUsers = admins.map(a => ({ ...a, type: 'admin' as const }));
        this.applyFilters();
      },
      error: (err) => console.error('Error loading admins:', err)
    });
  }

  applyFilters() {
    this.filteredUsers = this.allUsers.filter(user => {
      const matchSearch = !this.searchTerm ||
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      let matchStatus = true;
      if (this.filterStatus === 'active') {
        matchStatus = user.isActive === true;
      } else if (this.filterStatus === 'inactive') {
        matchStatus = user.isActive === false;
      }

      return matchSearch && matchStatus;
    });
  }

  getTotalUsers(): number {
    return this.allUsers.length;
  }

  getActiveUsers(): number {
    return this.allUsers.filter(u => u.isActive).length;
  }

  getInactiveUsers(): number {
    return this.allUsers.filter(u => !u.isActive).length;
  }

  getTotalAdmins(): number {
    return this.allUsers.length;
  }

  getTotalRegularUsers(): number {
    return 0; // No regular users anymore
  }

  openAddForm() {
    this.editingId = null;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(user: User) {
    this.editingId = user.id;
    this.formData = {
      username: user.username,
      email: user.email,
      password: '',
      fullName: user.fullName,
      role: 'admin', // Always admin
      avatar: user.avatar || '',
      phone: user.phone || ''
    };
    this.showForm = true;
  }

  resetForm() {
    this.formData = {
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'admin', // Always admin
      avatar: '',
      phone: ''
    };
  }

  saveUser() {
    if (!this.formData.username || !this.formData.email || !this.formData.fullName) {
      alert('Please fill all required fields');
      return;
    }

    if (this.editingId) {
      const user = this.allUsers.find(u => u.id === this.editingId);
      if (!user) return;

      const updated: any = {
        ...user,
        username: this.formData.username,
        email: this.formData.email,
        fullName: this.formData.fullName,
        avatar: this.formData.avatar || `https://i.pravatar.cc/150?u=${this.formData.username}`,
        phone: this.formData.phone,
        role: 'admin'
      };

      if (this.formData.password) {
        updated.password = this.formData.password;
      }

      this.http.put(`${this.baseAdmins}/${this.editingId}`, updated).subscribe({
        next: () => {
          this.loadUsers();
          this.showForm = false;
        },
        error: (err) => console.error('Error updating admin:', err)
      });
    } else {
      if (!this.formData.password) {
        alert('Password is required for new admins');
        return;
      }

      const newUser: any = {
        username: this.formData.username,
        email: this.formData.email,
        password: this.formData.password,
        fullName: this.formData.fullName,
        avatar: this.formData.avatar || `https://i.pravatar.cc/150?u=${this.formData.username}`,
        phone: this.formData.phone,
        dateCreated: new Date().toISOString(),
        dernierLogin: null,
        isActive: true,
        role: 'admin',
        type: 'admin'
      };

      this.http.post(this.baseAdmins, newUser).subscribe({
        next: () => {
          this.loadUsers();
          this.showForm = false;
        },
        error: (err) => console.error('Error creating admin:', err)
      });
    }
  }

  cancelForm() {
    this.showForm = false;
  }

  deleteUser(user: User) {
    if (!confirm('Are you sure you want to delete this administrator?')) return;

    this.http.delete(`${this.baseAdmins}/${user.id}`).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Error deleting admin:', err)
    });
  }

  toggleStatus(user: User) {
    const updated = { ...user, isActive: !user.isActive };
    this.http.put(`${this.baseAdmins}/${user.id}`, updated).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => console.error('Error updating admin status:', err)
    });
  }

  getRoleBadgeClass(role: string): string {
    return 'role-admin';
  }

  getRoleLabel(role: string): string {
    return 'Admin';
  }

  getTimeSinceLogin(date: string | null): string {
    if (!date) return 'Never logged in';
    const now = new Date();
    const loginDate = new Date(date);
    const diff = now.getTime() - loginDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  }
}

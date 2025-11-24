import { Component } from '@angular/core';
import { Auth } from '../../../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [FormsModule, CommonModule],
  styleUrls: ['./login.css']
})
export class LoginComponent {
  isLoading = false;
  message = '';
  isSuccess = false;

  loginData = {
    username: '',
    password: ''
  };

  showLoginPassword = false;

  constructor(private auth: Auth, private router: Router) {
    if (this.auth.isAuthenticated()) {
      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  login() {
    if (!this.loginData.username || !this.loginData.password) {
      this.message = 'Veuillez remplir tous les champs';
      this.isSuccess = false;
      return false;
    }

    this.isLoading = true;
    this.message = '';
    this.isSuccess = false;

    // Always login as admin
    this.auth.login(this.loginData.username, this.loginData.password, true)
    .subscribe({
      next: (user) => {
        this.message = 'Connexion réussie !';
        this.isSuccess = true;
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1000);
      },
      error: (err) => {
        this.message = err.message || 'Échec de la connexion';
        this.isSuccess = false;
        this.isLoading = false;
      }
    });

    return true;
  }

  resetLoginForm() {
    this.loginData = {
      username: '',
      password: ''
    };
  }
}

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
  isRegisterMode = false;
  isAdminLogin = true;
  isLoading = false;
  message = '';

  loginData = {
    username: '',
    password: ''
  };

  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  };

  showLoginPassword = false;
  showRegPassword = false;
  showConfirmPassword = false;

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
      return false;
    }

    this.isLoading = true;
    this.message = '';

    this.auth.login(this.loginData.username, this.loginData.password, true)
    .subscribe({
      next: (user) => {
        this.message = 'Connexion réussie !';
        this.isLoading = false;

        setTimeout(() => {
          if (this.auth.isAdmin()) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },
      error: (err) => {
        this.message = err.message || 'Échec de la connexion';
        this.isLoading = false;
      }
    });

    return true;
  }

  register() {
    console.log('Register button clicked');
    console.log('Form data:', this.registerData);

    if (!this.registerData.username || !this.registerData.email ||
        !this.registerData.password || !this.registerData.fullName) {
      this.message = 'Veuillez remplir tous les champs obligatoires';
      console.log('Validation failed: missing required fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.message = 'Adresse email invalide';
      console.log('Validation failed: invalid email');
      return false;
    }

    if (this.registerData.username.includes(' ')) {
      this.message = 'Le nom d\'utilisateur ne doit pas contenir d\'espaces';
      console.log('Validation failed: username contains spaces');
      return false;
    }

    if (this.registerData.password.length < 6) {
      this.message = 'Le mot de passe doit contenir au moins 6 caractères';
      console.log('Validation failed: password too short');
      return false;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas';
      console.log('Validation failed: passwords do not match');
      return false;
    }

    console.log('All validations passed, starting registration...');
    this.isLoading = true;
    this.message = 'Création de votre compte...';

    this.auth.register({
      username: this.registerData.username,
      email: this.registerData.email,
      password: this.registerData.password,
      fullName: this.registerData.fullName,
      phone: this.registerData.phone
    }).subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        this.message = 'Compte créé avec succès ! Connexion en cours...';

        setTimeout(() => {
          console.log('Auto-login started...');
          // FIXED: Use isAdmin = false for regular user auto-login
          this.auth.login(this.registerData.username, this.registerData.password, false).subscribe({
            next: () => {
              console.log('Auto-login successful');
              // FIXED: Redirect to home page instead of admin
              this.router.navigate(['/patrimoines']);
            },
            error: (err) => {
              console.error('Auto-login failed:', err);
              this.message = 'Compte créé ! Veuillez vous connecter.';
              this.isRegisterMode = false;
              this.isLoading = false;
            }
          });
        }, 1500);
      },
      error: (err) => {
        console.error('Registration failed:', err);
        this.message = err.message || 'Échec de la création du compte';
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

  resetRegisterForm() {
    this.registerData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: ''
    };
  }
}

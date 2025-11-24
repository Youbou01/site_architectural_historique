import { Component, inject } from '@angular/core';
import { Auth } from '../../../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isLoading = false;
  message = '';
  isSuccess = false;
  showLoginPassword = false;

  // Reactive form with validators
  loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    // FormArray to track login attempts (optional feature)
    attempts: this.fb.array([]),
  });

  constructor() {
    if (this.auth.isAuthenticated()) {
      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  // Getter for FormArray
  get attempts() {
    return this.loginForm.get('attempts') as FormArray;
  }

  // Getter for easy access to form controls
  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  login() {
    // Mark all fields as touched to show validation errors
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) {
      this.message = 'Veuillez remplir correctement tous les champs';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.isSuccess = false;

    const { username, password } = this.loginForm.value;

    // Add attempt to FormArray (track login history)
    this.attempts.push(
      this.fb.group({
        username: [username],
        timestamp: [new Date().toISOString()],
        success: [false],
      })
    );

    // Always login as admin
    this.auth.login(username!, password!).subscribe({
      next: (user) => {
        this.message = 'Connexion réussie !';
        this.isSuccess = true;
        this.isLoading = false;

        // Update last attempt as successful
        if (this.attempts.length > 0) {
          this.attempts.at(this.attempts.length - 1).patchValue({ success: true });
        }

        setTimeout(() => {
          this.router.navigate(['/admin']);
        }, 1000);
      },
      error: (err) => {
        this.message = err.message || 'Échec de la connexion';
        this.isSuccess = false;
        this.isLoading = false;
      },
    });
  }

  resetLoginForm() {
    this.loginForm.reset();
    this.attempts.clear();
  }
}

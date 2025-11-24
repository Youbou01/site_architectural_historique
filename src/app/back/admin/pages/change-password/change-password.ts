import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../../services/auth';

interface PasswordRequirement {
  id: string;
  text: string;
  met: boolean;
}

@Component({
  selector: 'app-change-password',
  imports: [FormsModule, CommonModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css']
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  isLoading = false;
  isSuccess = false;

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(private auth: Auth) {}

  hasNumber(str: string): boolean {
    return /\d/.test(str);
  }

  hasUppercase(str: string): boolean {
    return /[A-Z]/.test(str);
  }

  isPasswordValid(): boolean {
    return (
      this.newPassword.length >= 6 &&
      this.hasNumber(this.newPassword) &&
      this.hasUppercase(this.newPassword)
    );
  }

  getPasswordRequirements(): PasswordRequirement[] {
    return [
      {
        id: 'length',
        text: 'At least 6 characters',
        met: this.newPassword.length >= 6
      },
      {
        id: 'number',
        text: 'Contains a number',
        met: this.hasNumber(this.newPassword)
      },
      {
        id: 'uppercase',
        text: 'Contains an uppercase letter',
        met: this.hasUppercase(this.newPassword)
      }
    ];
  }

  updatePassword(): boolean {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.message = 'Please fill all fields';
      this.isSuccess = false;
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'New passwords do not match';
      this.isSuccess = false;
      return false;
    }

    if (!this.isPasswordValid()) {
      this.message = 'Password does not meet requirements';
      this.isSuccess = false;
      return false;
    }

    const user = this.auth.getUser();
    if (!user) {
      this.message = 'User not authenticated';
      this.isSuccess = false;
      return false;
    }

    this.isLoading = true;
    this.message = '';
    this.isSuccess = false;

    this.auth.changePassword(user.id, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.message = 'Password updated successfully!';
        this.isSuccess = true;
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isLoading = false;
      },
      error: (err) => {
        this.message = 'Error: ' + (err.message || 'Failed to update password');
        this.isSuccess = false;
        this.isLoading = false;
      }
    });

    return true;
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password';
import { Auth } from '../../../../services/auth';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('ChangePasswordComponent - Loading State and Success Message', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;
  let mockAuth: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    mockAuth = jasmine.createSpyObj('Auth', ['getUser', 'changePassword']);

    await TestBed.configureTestingModule({
      imports: [ChangePasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: mockAuth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should stop loading and show success message in green when password is updated successfully', (done) => {
    // Setup
    const mockUser = { id: '1', username: 'admin', password: 'oldpass' } as any;
    mockAuth.getUser.and.returnValue(mockUser);
    mockAuth.changePassword.and.returnValue(of(mockUser));

    component.oldPassword = 'oldpass';
    component.newPassword = 'NewPass123';
    component.confirmPassword = 'NewPass123';

    // Execute
    component.updatePassword();

    // Allow async operations to complete
    setTimeout(() => {
      // Verify
      expect(component.isLoading).toBe(false, 'Loading should be false after success');
      expect(component.message).toBe('Password updated successfully!', 'Success message should be displayed');
      expect(component.isSuccess).toBe(true, 'Success flag should be true for green styling');
      expect(component.oldPassword).toBe('', 'Old password should be cleared');
      expect(component.newPassword).toBe('', 'New password should be cleared');
      expect(component.confirmPassword).toBe('', 'Confirm password should be cleared');
      done();
    }, 100);
  });

  it('should stop loading and show error message when password update fails', (done) => {
    // Setup
    const mockUser = { id: '1', username: 'admin', password: 'oldpass' } as any;
    mockAuth.getUser.and.returnValue(mockUser);
    mockAuth.changePassword.and.returnValue(
      throwError(() => new Error('Ancien mot de passe incorrect'))
    );

    component.oldPassword = 'wrongoldpass';
    component.newPassword = 'NewPass123';
    component.confirmPassword = 'NewPass123';

    // Execute
    component.updatePassword();

    // Allow async operations to complete
    setTimeout(() => {
      // Verify
      expect(component.isLoading).toBe(false, 'Loading should be false after error');
      expect(component.message).toContain('Ancien mot de passe incorrect', 'Error message should be displayed');
      expect(component.isSuccess).toBe(false, 'Success flag should be false on error');
      done();
    }, 100);
  });

  it('should show validation error immediately without loading when passwords do not match', () => {
    // Setup
    const mockUser = { id: '1', username: 'admin' } as any;
    mockAuth.getUser.and.returnValue(mockUser);

    component.oldPassword = 'oldpass';
    component.newPassword = 'NewPass123';
    component.confirmPassword = 'DifferentPass123';

    // Execute
    component.updatePassword();

    // Verify
    expect(component.message).toBe('New passwords do not match');
    expect(component.isSuccess).toBe(false);
    expect(component.isLoading).toBe(false);
  });

  it('should show validation error when password does not meet requirements', () => {
    // Setup
    const mockUser = { id: '1', username: 'admin' } as any;
    mockAuth.getUser.and.returnValue(mockUser);

    component.oldPassword = 'oldpass';
    component.newPassword = 'weak';
    component.confirmPassword = 'weak';

    // Execute
    component.updatePassword();

    // Verify
    expect(component.message).toBe('Password does not meet requirements');
    expect(component.isSuccess).toBe(false);
    expect(component.isLoading).toBe(false);
  });
});

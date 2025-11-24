import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { Auth } from '../../../../services/auth';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';

describe('LoginComponent - Loading State and Error Display', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuth = jasmine.createSpyObj('Auth', ['login', 'isAuthenticated', 'isAdmin']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockAuth.isAuthenticated.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should stop loading and show error message when login fails with wrong password', (done) => {
    // Setup
    component.loginData = { username: 'admin', password: 'wrongpassword' };
    mockAuth.login.and.returnValue(throwError(() => new Error('Mot de passe incorrect')));

    // Execute
    component.login();

    // Allow async operations to complete
    setTimeout(() => {
      // Verify
      expect(component.isLoading).toBe(false, 'Loading should be false after error');
      expect(component.message).toBe('Mot de passe incorrect', 'Error message should be displayed');
      expect(component.isSuccess).toBe(false, 'Success flag should be false on error');
      done();
    }, 100);
  });

  it('should stop loading and show success message when login succeeds', (done) => {
    // Setup
    const mockUser = { id: '1', username: 'admin', password: 'admin' } as any;
    component.loginData = { username: 'admin', password: 'admin' };
    mockAuth.login.and.returnValue(of(mockUser));

    // Execute
    component.login();

    // Allow async operations to complete
    setTimeout(() => {
      // Verify
      expect(component.isLoading).toBe(false, 'Loading should be false after success');
      expect(component.message).toBe('Connexion réussie !', 'Success message should be displayed');
      expect(component.isSuccess).toBe(true, 'Success flag should be true');
      done();
    }, 100);
  });

  it('should show error message immediately when validation fails', () => {
    // Setup
    component.loginData = { username: '', password: '' };

    // Execute
    component.login();

    // Verify
    expect(component.message).toBe('Veuillez remplir tous les champs');
    expect(component.isSuccess).toBe(false);
    expect(component.isLoading).toBe(false);
  });
});

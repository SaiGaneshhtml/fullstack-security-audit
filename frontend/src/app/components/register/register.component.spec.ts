import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse = {
    user: { id: '2', name: 'New User', email: 'new@example.com', role: 'user', isEmailVerified: false },
    tokens: {
      access: { token: 'access-token', expires: '2099-01-01' },
      refresh: { token: 'refresh-token', expires: '2099-01-01' }
    }
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register'], {
      currentUserValue: null
    });

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields and no error', () => {
    expect(component.name).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should show error when submitting with all empty fields', () => {
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should show error when name is missing', () => {
    component.name = '';
    component.email = 'test@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should show error when email is missing', () => {
    component.name = 'Test';
    component.email = '';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should show error when password is missing', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should show error when password is less than 8 characters', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = 'short';
    component.onSubmit();
    expect(component.error).toBe('Password must be at least 8 characters long');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('should call authService.register and navigate to dashboard on success', () => {
    authServiceSpy.register.and.returnValue(of(mockAuthResponse));
    component.name = 'New User';
    component.email = 'new@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(authServiceSpy.register).toHaveBeenCalledWith('New User', 'new@example.com', 'Password1');
    expect(component.loading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on registration failure', () => {
    const errorResponse = { error: { message: 'Email already taken' } };
    authServiceSpy.register.and.returnValue(throwError(() => errorResponse));
    component.name = 'New User';
    component.email = 'existing@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.error).toBe('Email already taken');
    expect(component.loading).toBeFalse();
  });

  it('should set fallback error message when error has no message', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({})));
    component.name = 'New User';
    component.email = 'new@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.error).toBe('Registration failed. Please try again.');
  });

  it('should accept exactly 8 character password', () => {
    authServiceSpy.register.and.returnValue(of(mockAuthResponse));
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = 'Passw0rd'; // exactly 8 chars
    component.onSubmit();
    expect(authServiceSpy.register).toHaveBeenCalled();
  });
});

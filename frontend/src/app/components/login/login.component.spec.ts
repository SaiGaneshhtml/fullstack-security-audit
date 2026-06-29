import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NEVER, of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockAuthResponse = {
    user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin', isEmailVerified: true },
    tokens: {
      access: { token: 'access-token', expires: '2099-01-01' },
      refresh: { token: 'refresh-token', expires: '2099-01-01' }
    }
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login'], {
      currentUserValue: null
    });

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty fields and no error', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.error).toBe('');
    expect(component.loading).toBeFalse();
  });

  it('should show error when submitting with empty fields', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should show error when email is missing', () => {
    component.email = '';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should show error when password is missing', () => {
    component.email = 'admin@example.com';
    component.password = '';
    component.onSubmit();
    expect(component.error).toBe('Please fill in all fields');
  });

  it('should call authService.login and navigate to dashboard on success', () => {
    authServiceSpy.login.and.returnValue(of(mockAuthResponse));
    component.email = 'admin@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalledWith('admin@example.com', 'Password1');
    expect(component.loading).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set error message on login failure', () => {
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));
    component.email = 'wrong@example.com';
    component.password = 'WrongPass';
    component.onSubmit();
    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBeFalse();
  });

  it('should set fallback error message when error has no message', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({})));
    component.email = 'admin@example.com';
    component.password = 'SomePass';
    component.onSubmit();
    expect(component.error).toBe('Login failed. Please check your credentials.');
  });

  it('should set loading to true during login call', () => {
    authServiceSpy.login.and.returnValue(NEVER);
    component.email = 'admin@example.com';
    component.password = 'Password1';
    component.onSubmit();
    expect(component.loading).toBeTrue();
  });
});

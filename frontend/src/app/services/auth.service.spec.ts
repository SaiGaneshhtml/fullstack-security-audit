import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockAuthResponse = {
    user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin', isEmailVerified: true },
    tokens: {
      access: { token: 'access-token-abc', expires: '2099-01-01' },
      refresh: { token: 'refresh-token-xyz', expires: '2099-01-01' }
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null currentUserValue when no user in localStorage', () => {
    expect(service.currentUserValue).toBeNull();
  });

  it('should restore user from localStorage on construction', () => {
    localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));
    // Re-create service to trigger constructor with stored data
    const newService = new AuthService(TestBed.inject(HttpClient));
    expect(newService.currentUserValue).toEqual(mockAuthResponse.user);
  });

  it('should return null token when not stored', () => {
    expect(service.token).toBeNull();
  });

  it('should return accessToken from localStorage', () => {
    localStorage.setItem('accessToken', 'my-token');
    expect(service.token).toBe('my-token');
  });

  describe('login()', () => {
    it('should POST to /v1/auth/login and store tokens', () => {
      service.login('admin@example.com', 'Password1').subscribe(res => {
        expect(res).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'admin@example.com', password: 'Password1' });
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('accessToken')).toBe('access-token-abc');
      expect(localStorage.getItem('refreshToken')).toBe('refresh-token-xyz');
      expect(service.currentUserValue).toEqual(mockAuthResponse.user);
    });
  });

  describe('register()', () => {
    it('should POST to /v1/auth/register and store session', () => {
      service.register('Admin', 'admin@example.com', 'Password1').subscribe(res => {
        expect(res).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:3000/v1/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Admin', email: 'admin@example.com', password: 'Password1' });
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('accessToken')).toBe('access-token-abc');
      expect(service.currentUserValue).toEqual(mockAuthResponse.user);
    });
  });

  describe('logout()', () => {
    it('should POST to /v1/auth/logout when refreshToken exists and clear session', () => {
      localStorage.setItem('refreshToken', 'refresh-token-xyz');
      localStorage.setItem('accessToken', 'access-token-abc');
      localStorage.setItem('user', JSON.stringify(mockAuthResponse.user));

      service.logout();

      const req = httpMock.expectOne('http://localhost:3000/v1/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'refresh-token-xyz' });
      req.flush({});

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });

    it('should clear session immediately when no refreshToken exists', () => {
      localStorage.setItem('accessToken', 'some-token');
      service.logout();
      httpMock.expectNone('http://localhost:3000/v1/auth/logout');
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(service.currentUserValue).toBeNull();
    });

    it('should still clear session if logout POST request errors', () => {
      localStorage.setItem('refreshToken', 'refresh-token-xyz');
      service.logout();
      const req = httpMock.expectOne('http://localhost:3000/v1/auth/logout');
      req.error(new ProgressEvent('Network error'));
      expect(service.currentUserValue).toBeNull();
    });
  });

  describe('currentUser$', () => {
    it('should emit user changes via currentUser$ observable', (done) => {
      service.login('admin@example.com', 'Password1').subscribe();
      const req = httpMock.expectOne('http://localhost:3000/v1/auth/login');
      req.flush(mockAuthResponse);

      service.currentUser$.subscribe(user => {
        if (user) {
          expect(user.email).toBe('admin@example.com');
          done();
        }
      });
    });
  });
});

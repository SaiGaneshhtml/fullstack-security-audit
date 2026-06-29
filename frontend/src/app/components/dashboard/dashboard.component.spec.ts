import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService, User } from '../../services/auth.service';
import { AuditService, AuditLog, PaginatedResult } from '../../services/audit.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

const mockUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@example.com',
  role: 'admin',
  isEmailVerified: true
};

const mockLog: AuditLog = {
  id: 'log1',
  action: 'LOGIN_SUCCESS',
  user: { id: '1', name: 'Admin', email: 'admin@example.com' },
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  status: 'SUCCESS',
  details: { foo: 'bar' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
};

const mockPaginatedResult: PaginatedResult<AuditLog> = {
  results: [mockLog],
  page: 1,
  limit: 10,
  totalPages: 2,
  totalResults: 15
};

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let auditServiceSpy: jasmine.SpyObj<AuditService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUserValue: mockUser
    });
    auditServiceSpy = jasmine.createSpyObj('AuditService', ['getLogs']);
    auditServiceSpy.getLogs.and.returnValue(of(mockPaginatedResult));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuditService, useValue: auditServiceSpy }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentUser from authService on init', () => {
    expect(component.currentUser).toEqual(mockUser);
  });

  it('should redirect to /login if no user is logged in', async () => {
    const noUserAuthSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUserValue: null
    });

    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [DashboardComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
          { provide: AuthService, useValue: noUserAuthSpy },
          { provide: AuditService, useValue: auditServiceSpy }
        ]
      })
      .compileComponents();

    const localRouter = TestBed.inject(Router);
    spyOn(localRouter, 'navigate').and.returnValue(Promise.resolve(true));

    const noUserFixture = TestBed.createComponent(DashboardComponent);
    noUserFixture.detectChanges();
    expect(localRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should load logs on init and populate the logs array', () => {
    expect(auditServiceSpy.getLogs).toHaveBeenCalled();
    expect(component.logs.length).toBe(1);
    expect(component.logs[0].id).toBe('log1');
  });

  it('should update pagination state after loadLogs', () => {
    expect(component.totalPages).toBe(2);
    expect(component.totalResults).toBe(15);
  });

  it('should have 9 action options including "All Actions"', () => {
    expect(component.actionOptions.length).toBe(9);
    expect(component.actionOptions[0].value).toBe('');
    expect(component.actionOptions[0].label).toBe('All Actions');
  });

  it('should reset page to 1 and reload logs on filter change', () => {
    component.page = 3;
    component.onFilterChange();
    expect(component.page).toBe(1);
    expect(auditServiceSpy.getLogs).toHaveBeenCalled();
  });

  it('should change page and reload logs when valid page is provided', () => {
    const initialCallCount = auditServiceSpy.getLogs.calls.count();
    component.totalPages = 5;
    component.changePage(2);
    expect(component.page).toBe(2);
    expect(auditServiceSpy.getLogs.calls.count()).toBeGreaterThan(initialCallCount);
  });

  it('should NOT change page if page < 1', () => {
    component.page = 1;
    component.totalPages = 5;
    const initialCallCount = auditServiceSpy.getLogs.calls.count();
    component.changePage(0);
    expect(component.page).toBe(1);
    expect(auditServiceSpy.getLogs.calls.count()).toBe(initialCallCount);
  });

  it('should NOT change page if page > totalPages', () => {
    component.page = 1;
    component.totalPages = 3;
    const initialCallCount = auditServiceSpy.getLogs.calls.count();
    component.changePage(4);
    expect(component.page).toBe(1);
    expect(auditServiceSpy.getLogs.calls.count()).toBe(initialCallCount);
  });

  it('should set selectedLog when viewDetails is called', () => {
    expect(component.selectedLog).toBeNull();
    component.viewDetails(mockLog);
    expect(component.selectedLog).toEqual(mockLog);
  });

  it('should clear selectedLog when closeModal is called', () => {
    component.selectedLog = mockLog;
    component.closeModal();
    expect(component.selectedLog).toBeNull();
  });

  it('should call authService.logout and navigate to /login on logout', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should format dates correctly', () => {
    const date = '2026-01-01T00:00:00.000Z';
    const formatted = component.formatDate(date);
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('should return formatted JSON from getJsonDetails', () => {
    const details = { key: 'value' };
    const result = component.getJsonDetails(details);
    expect(result).toContain('"key"');
    expect(result).toContain('"value"');
  });

  it('should return "None" from getJsonDetails when details is null/undefined', () => {
    expect(component.getJsonDetails(null)).toBe('None');
    expect(component.getJsonDetails(undefined)).toBe('None');
  });

  it('should redirect to /login on 401 error from loadLogs', () => {
    auditServiceSpy.getLogs.and.returnValue(throwError(() => ({ status: 401 })));
    component.loadLogs();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to /login on 403 error from loadLogs', () => {
    auditServiceSpy.getLogs.and.returnValue(throwError(() => ({ status: 403 })));
    component.loadLogs();
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let httpMock: HttpTestingController;

  const mockResponse = {
    results: [
      {
        id: 'log1',
        action: 'LOGIN_SUCCESS',
        user: { id: '1', name: 'Admin', email: 'admin@example.com' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        status: 'SUCCESS' as const,
        details: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }
    ],
    page: 1,
    limit: 10,
    totalPages: 3,
    totalResults: 25
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuditService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuditService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET /v1/audit-logs with no params', () => {
    service.getLogs({}).subscribe(res => {
      expect(res.results.length).toBe(1);
      expect(res.totalResults).toBe(25);
    });

    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/v1/audit-logs');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should append action param to request URL', () => {
    service.getLogs({ action: 'LOGIN_FAILED' }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:3000/v1/audit-logs' &&
      r.params.get('action') === 'LOGIN_FAILED'
    );
    expect(req.request.params.get('action')).toBe('LOGIN_FAILED');
    req.flush(mockResponse);
  });

  it('should append status param to request URL', () => {
    service.getLogs({ status: 'FAILED' }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:3000/v1/audit-logs' &&
      r.params.get('status') === 'FAILED'
    );
    expect(req.request.params.get('status')).toBe('FAILED');
    req.flush(mockResponse);
  });

  it('should append page and limit params', () => {
    service.getLogs({ page: 2, limit: 5 }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:3000/v1/audit-logs' &&
      r.params.get('page') === '2' &&
      r.params.get('limit') === '5'
    );
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush(mockResponse);
  });

  it('should append sortBy param', () => {
    service.getLogs({ sortBy: 'createdAt:asc' }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:3000/v1/audit-logs' &&
      r.params.get('sortBy') === 'createdAt:asc'
    );
    expect(req.request.params.get('sortBy')).toBe('createdAt:asc');
    req.flush(mockResponse);
  });

  it('should append user param', () => {
    service.getLogs({ user: 'userId123' }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:3000/v1/audit-logs' &&
      r.params.get('user') === 'userId123'
    );
    expect(req.request.params.get('user')).toBe('userId123');
    req.flush(mockResponse);
  });

  it('should NOT append undefined/null optional params', () => {
    service.getLogs({ page: 1 }).subscribe();

    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/v1/audit-logs');
    expect(req.request.params.has('action')).toBeFalse();
    expect(req.request.params.has('status')).toBeFalse();
    expect(req.request.params.has('user')).toBeFalse();
    expect(req.request.params.has('sortBy')).toBeFalse();
    req.flush(mockResponse);
  });

  it('should return correct PaginatedResult structure', () => {
    service.getLogs({ limit: 10, page: 1 }).subscribe(result => {
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.totalResults).toBe(25);
      expect(Array.isArray(result.results)).toBeTrue();
    });

    const req = httpMock.expectOne(r => r.url === 'http://localhost:3000/v1/audit-logs');
    req.flush(mockResponse);
  });
});

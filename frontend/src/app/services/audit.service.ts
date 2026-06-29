import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLog {
  id: string;
  action: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'FAILED';
  details?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private apiUrl = 'http://localhost:3000/v1/audit-logs';

  constructor(private http: HttpClient) {}

  getLogs(params: {
    action?: string;
    status?: 'SUCCESS' | 'FAILED';
    user?: string;
    sortBy?: string;
    limit?: number;
    page?: number;
  }): Observable<PaginatedResult<AuditLog>> {
    let httpParams = new HttpParams();
    if (params.action) httpParams = httpParams.set('action', params.action);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.user) httpParams = httpParams.set('user', params.user);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.page) httpParams = httpParams.set('page', params.page.toString());

    return this.http.get<PaginatedResult<AuditLog>>(this.apiUrl, { params: httpParams });
  }
}

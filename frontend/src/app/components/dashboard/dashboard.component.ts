import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { AuditService, AuditLog } from '../../services/audit.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  logs: AuditLog[] = [];
  
  // Pagination
  page = 1;
  limit = 10;
  totalPages = 1;
  totalResults = 0;

  // Filters
  selectedAction = '';
  selectedStatus = '';
  sortBy = 'createdAt:desc';

  // Stats
  totalEventsCount = 0;
  successEventsCount = 0;
  failedEventsCount = 0;
  failedLoginsCount = 0;

  // Modal Detail
  selectedLog: AuditLog | null = null;

  loading = false;
  statsLoading = false;

  actionOptions = [
    { label: 'All Actions', value: '' },
    { label: 'Register Success', value: 'REGISTER_SUCCESS' },
    { label: 'Register Failed', value: 'REGISTER_FAILED' },
    { label: 'Login Success', value: 'LOGIN_SUCCESS' },
    { label: 'Login Failed', value: 'LOGIN_FAILED' },
    { label: 'Logout', value: 'LOGOUT' },
    { label: 'User Create', value: 'USER_CREATE' },
    { label: 'User Update', value: 'USER_UPDATE' },
    { label: 'User Delete', value: 'USER_DELETE' }
  ];

  constructor(
    private authService: AuthService,
    private auditService: AuditService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    if (this.currentUser) {
      this.loadLogs();
      this.loadStats();
    }
  }

  loadLogs(): void {
    this.loading = true;
    const params: any = {
      page: this.page,
      limit: this.limit,
      sortBy: this.sortBy
    };

    if (this.selectedAction) {
      params.action = this.selectedAction;
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }

    this.auditService.getLogs(params).subscribe({
      next: (res) => {
        this.logs = res.results;
        this.totalPages = res.totalPages;
        this.totalResults = res.totalResults;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching logs', err);
        this.loading = false;
        if (err.status === 401 || err.status === 403) {
          // If unauthorized (e.g. token expired, or user not admin), logout
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;

    // Load total counts
    this.auditService.getLogs({ limit: 1 }).subscribe(res => {
      this.totalEventsCount = res.totalResults;
    });

    // Load success counts
    this.auditService.getLogs({ limit: 1, status: 'SUCCESS' }).subscribe(res => {
      this.successEventsCount = res.totalResults;
    });

    // Load failure counts
    this.auditService.getLogs({ limit: 1, status: 'FAILED' }).subscribe(res => {
      this.failedEventsCount = res.totalResults;
    });

    // Load failed login alerts
    this.auditService.getLogs({ limit: 1, action: 'LOGIN_FAILED' }).subscribe(res => {
      this.failedLoginsCount = res.totalResults;
      this.statsLoading = false;
    });
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadLogs();
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.page = newPage;
      this.loadLogs();
    }
  }

  viewDetails(log: AuditLog): void {
    this.selectedLog = log;
  }

  closeModal(): void {
    this.selectedLog = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper formatting utils
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }

  getJsonDetails(details: any): string {
    if (!details) return 'None';
    return JSON.stringify(details, null, 2);
  }
}

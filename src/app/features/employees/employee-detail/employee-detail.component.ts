import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastMessageOptions, MenuItem } from 'primeng/api';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  loading = false;
  messages: ToastMessageOptions[] = [];

  breadcrumbItems: MenuItem[] = [
    { label: 'Employees', routerLink: '/employees' },
    { label: 'Detail' },
  ];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadEmployee(id);
  }

  loadEmployee(id: number): void {
    this.loading = true;
    this.messages = [];
    this.employeeService.getEmployee(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.loading = false;
        this.breadcrumbItems = [
          { label: 'Employees', routerLink: '/employees' },
          { label: data.name },
        ];
        this.messages = [
          {
            severity: 'success',
            icon: 'pi-check-circle',
            summary: 'Loaded',
            detail: `${data.name}'s profile loaded successfully.`,
          },
        ];
      },
      error: () => {
        this.loading = false;
        this.messages = [
          {
            severity: 'error',
            icon: 'pi-times-circle',
            summary: 'Error',
            detail: 'Failed to load employee data. Please try again.',
          },
        ];
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/employees']);
  }

  onEdit(): void {
    this.messages = [
      {
        severity: 'info',
        icon: 'pi-info-circle',
        summary: 'Coming Soon',
        detail: 'Edit Employee feature is not yet implemented.',
      },
    ];
  }

  onDelete(): void {
    this.messages = [
      {
        severity: 'warn',
        icon: 'pi-exclamation-triangle',
        summary: 'Coming Soon',
        detail: 'Delete Employee feature is not yet implemented.',
      },
    ];
  }

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | undefined {
    const map: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      active: 'success',
      inactive: 'danger',
      'on-leave': 'warn',
    };
    return map[status] ?? undefined;
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      active: 'Active',
      inactive: 'Inactive',
      'on-leave': 'On Leave',
    };
    return map[status] ?? status;
  }
}

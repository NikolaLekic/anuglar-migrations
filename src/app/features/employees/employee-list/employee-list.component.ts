import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageOptions, MenuItem } from 'primeng/api';
import { Employee } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  messages: ToastMessageOptions[] = [];

  breadcrumbItems: MenuItem[] = [{ label: 'Employees' }];
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.messages = [];
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
        this.messages = [
          {
            severity: 'success',
            summary: 'Success',
            detail: `${data.length} employees retrieved successfully.`,
          },
        ];
      },
      error: () => {
        this.loading = false;
        this.messages = [
          {
            severity: 'error',
            summary: 'Error',
            detail:
              'Cannot reach the API server. Ensure json-server is running on port 3000.',
          },
        ];
      },
    });
  }

  onRowSelect(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  onAddNew(): void {
    this.messages = [
      {
        severity: 'info',
        summary: 'Coming Soon',
        detail: 'Add Employee feature is not yet implemented.',
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

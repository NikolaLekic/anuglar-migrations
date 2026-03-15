import { Component, OnInit } from '@angular/core';
import { Message } from 'primeng/api';
import { Employee } from '../../core/models/employee.model';
import { MOCK_EMPLOYEES } from './showcase.fixture';

@Component({
  selector: 'app-showcase',
  templateUrl: './showcase.component.html',
  styleUrls: ['./showcase.component.scss'],
})
export class ShowcaseComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;

  // Message examples
  successMessages: Message[] = [];
  infoMessages: Message[] = [];
  warnMessages: Message[] = [];
  errorMessages: Message[] = [];
  allMessages: Message[] = [];

  // Button states
  buttonDisabled = false;
  buttonLoading = false;

  // Breadcrumb items
  breadcrumbItems = [
    { label: 'Home', icon: 'pi pi-home', url: '/' },
    { label: 'Features', url: '/employees' },
    { label: 'Showcase' },
  ];
  breadcrumbHome = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit(): void {
    this.employees = MOCK_EMPLOYEES;
    this.selectedEmployee = this.employees[0];
    this.initializeMessages();
  }

  initializeMessages(): void {
    this.successMessages = [
      {
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed successfully',
      },
    ];

    this.infoMessages = [
      {
        severity: 'info',
        summary: 'Info',
        detail: 'This is an informational message',
      },
    ];

    this.warnMessages = [
      {
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please review this warning carefully',
      },
    ];

    this.errorMessages = [
      {
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred during processing',
      },
    ];

    this.allMessages = [
      ...this.successMessages,
      ...this.infoMessages,
      ...this.warnMessages,
      ...this.errorMessages,
    ];
  }

  onRowSelect(event: { data?: Employee }): void {
    // Row selected event handler
    if (event.data) {
      this.selectedEmployee = event.data;
    }
  }

  toggleButtonDisabled(): void {
    this.buttonDisabled = !this.buttonDisabled;
  }

  toggleButtonLoading(): void {
    this.buttonLoading = !this.buttonLoading;
  }

  onButtonClick(_buttonType: string): void {
    // Button click event handler
    // In a real application, this would trigger specific actions
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | undefined {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'on-leave':
        return 'warning';
      default:
        return 'info';
    }
  }

  trackById(_index: number, employee: Employee): number {
    return employee.id;
  }
}

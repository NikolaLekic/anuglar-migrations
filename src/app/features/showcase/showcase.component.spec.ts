import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ShowcaseComponent } from './showcase.component';
import { SharedModule } from '../../shared/shared.module';
import { MOCK_EMPLOYEES } from './showcase.fixture';

describe('ShowcaseComponent', () => {
  let component: ShowcaseComponent;
  let fixture: ComponentFixture<ShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowcaseComponent],
      imports: [SharedModule, NoopAnimationsModule, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize employees from fixture data', () => {
      expect(component.employees).toBeDefined();
      expect(component.employees.length).toBe(MOCK_EMPLOYEES.length);
      expect(component.employees).toEqual(MOCK_EMPLOYEES);
    });

    it('should set first employee as selected employee', () => {
      expect(component.selectedEmployee).toBeDefined();
      expect(component.selectedEmployee).toEqual(MOCK_EMPLOYEES[0]);
    });

    it('should initialize all message types', () => {
      expect(component.successMessages.length).toBeGreaterThan(0);
      expect(component.infoMessages.length).toBeGreaterThan(0);
      expect(component.warnMessages.length).toBeGreaterThan(0);
      expect(component.errorMessages.length).toBeGreaterThan(0);
    });

    it('should initialize button states', () => {
      expect(component.buttonDisabled).toBe(false);
      expect(component.buttonLoading).toBe(false);
    });

    it('should initialize breadcrumb items', () => {
      expect(component.breadcrumbItems).toBeDefined();
      expect(component.breadcrumbItems.length).toBeGreaterThan(0);
      expect(component.breadcrumbHome).toBeDefined();
    });
  });

  describe('Message Initialization', () => {
    it('should create success message with correct properties', () => {
      const successMessage = component.successMessages[0];
      expect(successMessage.severity).toBe('success');
      expect(successMessage.summary).toBeDefined();
      expect(successMessage.detail).toBeDefined();
    });

    it('should create info message with correct properties', () => {
      const infoMessage = component.infoMessages[0];
      expect(infoMessage.severity).toBe('info');
      expect(infoMessage.summary).toBeDefined();
      expect(infoMessage.detail).toBeDefined();
    });

    it('should create warning message with correct properties', () => {
      const warnMessage = component.warnMessages[0];
      expect(warnMessage.severity).toBe('warn');
      expect(warnMessage.summary).toBeDefined();
      expect(warnMessage.detail).toBeDefined();
    });

    it('should create error message with correct properties', () => {
      const errorMessage = component.errorMessages[0];
      expect(errorMessage.severity).toBe('error');
      expect(errorMessage.summary).toBeDefined();
      expect(errorMessage.detail).toBeDefined();
    });

    it('should combine all messages into allMessages array', () => {
      expect(component.allMessages.length).toBe(4);
      expect(component.allMessages).toContain(component.successMessages[0]);
      expect(component.allMessages).toContain(component.infoMessages[0]);
      expect(component.allMessages).toContain(component.warnMessages[0]);
      expect(component.allMessages).toContain(component.errorMessages[0]);
    });
  });

  describe('Button State Management', () => {
    it('should toggle button disabled state', () => {
      const initialState = component.buttonDisabled;
      component.toggleButtonDisabled();
      expect(component.buttonDisabled).toBe(!initialState);
      component.toggleButtonDisabled();
      expect(component.buttonDisabled).toBe(initialState);
    });

    it('should toggle button loading state', () => {
      const initialState = component.buttonLoading;
      component.toggleButtonLoading();
      expect(component.buttonLoading).toBe(!initialState);
      component.toggleButtonLoading();
      expect(component.buttonLoading).toBe(initialState);
    });
  });

  describe('Event Handlers', () => {
    it('should handle button click event', () => {
      expect(() => component.onButtonClick('test')).not.toThrow();
    });

    it('should handle row select event with data', () => {
      const mockEvent = { data: MOCK_EMPLOYEES[0] };
      component.onRowSelect(mockEvent);
      expect(component.selectedEmployee).toEqual(mockEvent.data);
    });

    it('should handle row select event without data', () => {
      const mockEvent = {};
      const previousSelection = component.selectedEmployee;
      component.onRowSelect(mockEvent);
      expect(component.selectedEmployee).toEqual(previousSelection);
    });
  });

  describe('Status Severity Mapping', () => {
    it('should return success severity for active status', () => {
      expect(component.getStatusSeverity('active')).toBe('success');
    });

    it('should return danger severity for inactive status', () => {
      expect(component.getStatusSeverity('inactive')).toBe('danger');
    });

    it('should return warn severity for on-leave status', () => {
      expect(component.getStatusSeverity('on-leave')).toBe('warn');
    });

    it('should return info severity for unknown status', () => {
      expect(component.getStatusSeverity('unknown')).toBe('info');
    });
  });

  describe('UI Rendering', () => {
    it('should render showcase header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.showcase-header h1');
      expect(header?.textContent).toContain('PrimeNG Component Showcase');
    });

    it('should render all section titles', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const sections = compiled.querySelectorAll('.section-title');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('should render breadcrumb component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const breadcrumb = compiled.querySelector('p-breadcrumb');
      expect(breadcrumb).toBeTruthy();
    });

    it('should render message components', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const messages = compiled.querySelectorAll('p-messages');
      expect(messages.length).toBeGreaterThan(0);
    });

    it('should render button components', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const buttons = compiled.querySelectorAll('p-button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should render table component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const table = compiled.querySelector('p-table');
      expect(table).toBeTruthy();
    });

    it('should render card components', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('p-card');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should render tag components', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tags = compiled.querySelectorAll('p-tag');
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('Data Display', () => {
    it('should display employee data in table', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tableRows = compiled.querySelectorAll('p-table tbody tr');
      expect(tableRows.length).toBeGreaterThan(0);
    });

    it('should display correct number of employee cards', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const cards = compiled.querySelectorAll('.card-grid p-card');
      // Should display first 3 employees in card section
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should display all message severities', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const messageComponents = compiled.querySelectorAll('p-messages');
      // Should have success, info, warn, error, and all messages
      expect(messageComponents.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Button Variants', () => {
    it('should render primary buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Primary');
    });

    it('should render secondary buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Secondary');
    });

    it('should render success buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Success');
    });

    it('should render info buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Info');
    });

    it('should render warning buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Warning');
    });

    it('should render danger buttons', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const text = compiled.textContent || '';
      expect(text).toContain('Danger');
    });
  });

  describe('Component Integration', () => {
    it('should have no errors on initialization', () => {
      expect(() => {
        const testFixture = TestBed.createComponent(ShowcaseComponent);
        testFixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle component lifecycle without errors', () => {
      expect(() => {
        component.ngOnInit();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should properly initialize all component sections', () => {
      expect(component.employees).toBeDefined();
      expect(component.successMessages).toBeDefined();
      expect(component.infoMessages).toBeDefined();
      expect(component.warnMessages).toBeDefined();
      expect(component.errorMessages).toBeDefined();
      expect(component.breadcrumbItems).toBeDefined();
    });
  });
});

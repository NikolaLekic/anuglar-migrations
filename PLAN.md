# Angular 17 Admin Dashboard — Implementation Plan

## Context

Greenfield Angular 17 admin dashboard using NgModule architecture, PrimeNG 17 UI library, and
json-server as a mock REST API. The app manages **Employee** data across two pages: a list page
and a detail/view page. The entire visual theme is custom — no default PrimeNG theme is applied;
only the structural base CSS is imported and all cosmetics are driven by CSS custom properties
defined in project-owned files.

---

## Tech Stack

| Package                            | Version     | Purpose                    |
| ---------------------------------- | ----------- | -------------------------- |
| `@angular/core` + CLI              | `~17.3.x`   | Core framework             |
| `typescript`                       | `~5.2.2`    | Language                   |
| `primeng`                          | `^17.18.11` | UI component library       |
| `primeicons`                       | `^6.0.1`    | Icon font                  |
| `primeflex`                        | `^3.3.1`    | Utility CSS                |
| `json-server`                      | `^0.17.4`   | Mock REST API              |
| `concurrently`                     | `^8.2.2`    | Run both servers together  |
| `@angular-eslint/schematics`       | `^17.5.2`   | Angular ESLint integration |
| `@typescript-eslint/eslint-plugin` | `^7.x`      | TypeScript ESLint rules    |

---

## Step 0 — Write PLAN.md to Project Root

This file. Written first so the full implementation reference lives alongside source code.

---

## Step 1 — Scaffold the Angular Project

```bash
ng new ai-app --style=scss --routing=true --no-standalone --skip-git
cd ai-app
```

`--no-standalone` forces NgModule-based architecture. `--style=scss` enables SCSS globally.

---

## Step 2 — Install All Dependencies

```bash
# Runtime
npm install primeng@^17.18.11 primeicons@^6.0.1 primeflex@^3.3.1

# Dev: mock API runner
npm install -D json-server@^0.17.4 concurrently@^8.2.2

# Dev: ESLint for Angular 17
ng add @angular-eslint/schematics@^17.5.2
```

---

## Step 3 — Configure angular.json Styles Array

```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "node_modules/primeng/resources/primeng.min.css",
  "node_modules/primeflex/primeflex.css",
  "src/assets/styles/theme.css",
  "src/assets/styles/resources.min.css",
  "src/styles.scss"
]
```

**Order matters:**

1. `primeicons.css` — icon font, no dependencies
2. `primeng.min.css` — structural layout; declares slots for CSS variables
3. `primeflex.css` — utility classes
4. `theme.css` (custom) — CSS custom properties consumed by PrimeNG structural rules
5. `resources.min.css` (custom) — component-class selector overrides (higher specificity)
6. `styles.scss` — global app resets and typography

No PrimeNG theme CSS file is ever imported.

---

## Step 4 — Configure ESLint (.eslintrc.json)

```json
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
        "plugin:@typescript-eslint/recommended"
      ],
      "rules": {
        "@angular-eslint/component-selector": [
          "error",
          { "type": "element", "prefix": "app", "style": "kebab-case" }
        ],
        "@angular-eslint/directive-selector": [
          "error",
          { "type": "attribute", "prefix": "app", "style": "camelCase" }
        ],
        "@angular-eslint/no-empty-lifecycle-method": "error",
        "@angular-eslint/use-lifecycle-interface": "error",
        "@angular-eslint/no-input-rename": "error",
        "@angular-eslint/no-output-rename": "error",
        "@typescript-eslint/explicit-function-return-type": [
          "warn",
          { "allowExpressions": true }
        ],
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { "argsIgnorePattern": "^_" }
        ],
        "@typescript-eslint/prefer-readonly": "error",
        "no-console": ["warn", { "allow": ["warn", "error"] }]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@angular-eslint/template/recommended"],
      "rules": {
        "@angular-eslint/template/no-negated-async": "error",
        "@angular-eslint/template/use-track-by-function": "warn"
      }
    }
  ]
}
```

---

## Step 5 — Theme Files

### `src/assets/styles/theme.css`

All CSS custom properties. PrimeNG structural CSS reads these at paint time.

Key variables: `--primary-color`, `--surface-*`, `--text-color`, `--border-radius`,
`--font-family`, `--card-shadow`, `--focus-ring`, `--transition-speed`.

### `src/assets/styles/resources.min.css`

Component-class overrides at higher specificity. Sections:

- **Global**: `box-sizing`, `body` font/background
- **Breadcrumb**: transparent background, custom text colors, last-item bold
- **Messages**: colored left-border style per severity (success/error/warn/info)
- **Buttons**: primary color, hover states, focus ring, secondary/warning/danger variants
- **Table**: header uppercase, hover rows, striped style, paginator
- **Card**: border, shadow, padding
- **Tag**: pill shape, per-severity colors

### `src/styles.scss`

Google Fonts Inter import, global resets, `.page-wrapper`, `.page-header` layout helpers.

---

## Step 6 — Module Architecture

### File Structure

```
src/app/
├── core/
│   ├── models/employee.model.ts
│   ├── services/employee.service.ts
│   └── core.module.ts
├── shared/
│   ├── layout/
│   │   ├── header/
│   │   └── main-layout/
│   └── shared.module.ts
├── features/
│   └── employees/
│       ├── employee-list/
│       ├── employee-detail/
│       └── employees.module.ts
├── app-routing.module.ts
├── app.component.ts / .html / .scss
└── app.module.ts
```

### Employee Model

```typescript
export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  phone: string;
  address: string;
  salary: number;
  manager: string;
  bio: string;
}
```

### EmployeeService

- `getEmployees(): Observable<Employee[]>` — GET `http://localhost:3000/employees`
- `getEmployee(id: number): Observable<Employee>` — GET `http://localhost:3000/employees/:id`

### Module Tree

- `AppModule` imports `CoreModule`, `SharedModule`, `AppRoutingModule`, `BrowserAnimationsModule`
- `CoreModule` (singleton guard) imports `HttpClientModule`
- `SharedModule` imports + exports all PrimeNG modules, `CommonModule`, `RouterModule`, layout components
- `EmployeesModule` (lazy-loaded) imports `SharedModule`, declares both page components

### Routes

| Path             | Result                           |
| ---------------- | -------------------------------- |
| `/`              | Redirect → `/employees`          |
| `/employees`     | `EmployeeListComponent` (lazy)   |
| `/employees/:id` | `EmployeeDetailComponent` (lazy) |
| `**`             | Redirect → `/employees`          |

---

## Step 7 — Layout Components

- `AppComponent` — single `<router-outlet>`
- `MainLayoutComponent` — `<app-header>` + `<router-outlet>` inside `<main>`
- `HeaderComponent` — sticky indigo header, brand logo, Employees nav link with `routerLinkActive`

---

## Step 8 — Employee List Page

**Key features:**

- `p-breadcrumb` — Home / Employees
- Page header with "Refresh" (outlined secondary) and "Add New" (primary) buttons
- `p-messages` bound to `messages[]` — success on load, error on failure, info on "Add New"
- `p-table` — sortable columns, pagination (10/25/50), `selectionMode="single"`, `[loading]` state
- Columns: #, Name, Email, Department, Role, Status (p-tag), Join Date
- Row click → `router.navigate(['/employees', id])`
- `ngOnInit` triggers `loadEmployees()`

---

## Step 9 — Employee Detail Page

**Key features:**

- `p-breadcrumb` — Home / Employees / {name} (updated after load)
- Page header with Back (outlined), Edit (warning), Delete (danger) buttons
- `p-messages` — success on load, error on failure, info/warn on mock Edit/Delete
- Loading spinner state while fetching
- Two `p-card` components side by side: Personal Info + Employment Info
- Full-width `p-card` for Biography
- `ActivatedRoute` snapshot reads `:id` param
- Salary formatted with `| currency`, date with `| date`

---

## Step 10 — Mock Data (db.json)

12 employee records across departments: Engineering, Product, Design, Marketing, Finance, Sales.
Statuses distributed: active (9), inactive (1), on-leave (2).

---

## Step 11 — package.json Scripts

```json
"start":      "ng serve --port 4200 --open",
"start:api":  "json-server --watch db.json --port 3000 --delay 300",
"start:all":  "concurrently --kill-others-on-fail --names \"API,APP\" \"npm run start:api\" \"npm run start\"",
"lint":       "ng lint",
"lint:fix":   "ng lint --fix",
"build:prod": "ng build --configuration production"
```

`--delay 300` makes loading states visually testable.

---

## Verification Checklist

| Check                          | How                                    |
| ------------------------------ | -------------------------------------- |
| TypeScript compiles            | `npx tsc --noEmit`                     |
| ESLint clean                   | `npm run lint`                         |
| API returns data               | `curl http://localhost:3000/employees` |
| List page success message      | Load `/employees`                      |
| Table pagination/sort          | Interact with table                    |
| Row click → detail             | Click any row                          |
| Breadcrumb shows employee name | On detail page                         |
| Back button returns to list    | Click Back                             |
| Edit/Delete show mock messages | Click both buttons                     |
| Error state when API is down   | Stop json-server, reload               |
| Lazy chunk loaded              | Network tab, JS filter                 |
| Production build               | `npm run build:prod`                   |

# Upgrade Execution Log — Angular 18 → 19 (PrimeNG 18 → 19, PrimeFlex 3 → 4)

This document is a chronological record of every change made, why it was made, and what
commands were run during the migration of `ai-app` from Angular 18 to Angular 19.

---

## Environment

| Item            | Value                |
| --------------- | -------------------- |
| OS              | Windows 10 (`win32`) |
| Node.js         | v20.11.1             |
| npm             | 10.2.4               |
| Shell           | bash (Git Bash)      |
| Starting branch | `angular-v19`        |

---

## Step 1 — Pre-flight Verification

### Why

Establish a known-good baseline before touching any packages. Any test failure discovered
post-migration would otherwise be ambiguous — was it pre-existing or introduced?

### Commands run

```bash
npm test -- --watch=false
npm run build:prod
```

### Results

| Check            | Result                           |
| ---------------- | -------------------------------- |
| Unit tests       | 43/43 PASS                       |
| Production build | SUCCESS — 1.54 MB initial bundle |

Working tree was already clean (no uncommitted changes to checkpoint).

---

## Step 2 — Angular 19 Core Upgrade (`ng update`)

### What changed

All Angular core packages, the CLI, the build adapter, `zone.js`, and `typescript` were
upgraded by running:

```bash
ng update @angular/core@19 @angular/cli@19
```

The Angular CLI temporarily installed `@angular/cli@19.2.22` to execute the update.

### Version changes

| Package                             | Before  | After    |
| ----------------------------------- | ------- | -------- |
| `@angular/animations`               | ^18.2.0 | ^19.2.20 |
| `@angular/common`                   | ^18.2.0 | ^19.2.20 |
| `@angular/compiler`                 | ^18.2.0 | ^19.2.20 |
| `@angular/core`                     | ^18.2.0 | ^19.2.20 |
| `@angular/forms`                    | ^18.2.0 | ^19.2.20 |
| `@angular/platform-browser`         | ^18.2.0 | ^19.2.20 |
| `@angular/platform-browser-dynamic` | ^18.2.0 | ^19.2.20 |
| `@angular/router`                   | ^18.2.0 | ^19.2.20 |
| `@angular/cli`                      | ^18.2.0 | ^19.2.22 |
| `@angular/compiler-cli`             | ^18.2.0 | ^19.2.20 |
| `@angular-devkit/build-angular`     | ^18.2.0 | ^19.2.22 |
| `zone.js`                           | ~0.14.3 | ~0.15.1  |
| `typescript`                        | ~5.4.2  | ~5.8.3   |

### Migration schematics run automatically

`ng update @angular/core@19` executes two migration schematics:

**1. `standalone-false` schematic (critical)**

Angular 19 changed the default value of `standalone` in `@Component`, `@Directive`, and
`@Pipe` from `false` to `true`. Any class declared in `@NgModule.declarations` without
an explicit `standalone: false` would silently become standalone and fail to compile.

The schematic added `standalone: false` to all 6 components automatically:

```
UPDATE src/app/app.component.ts
UPDATE src/app/shared/layout/header/header.component.ts
UPDATE src/app/shared/layout/main-layout/main-layout.component.ts
UPDATE src/app/features/employees/employee-list/employee-list.component.ts
UPDATE src/app/features/employees/employee-detail/employee-detail.component.ts
UPDATE src/app/features/showcase/showcase.component.ts
```

**Before (Angular 18):**

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
```

**After (Angular 19):**

```typescript
@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
```

**2. `ExperimentalPendingTasks` rename schematic**

Renamed `ExperimentalPendingTasks` to `PendingTasks`. Not used in this project — no changes.

### Commit

```
feat: upgrade Angular 18 → 19 core packages
```

---

## Step 3 — @angular-eslint Upgrade

### Why a separate command

`@angular-eslint` is not part of Angular's core package group and must be updated separately.
`ng update` requires a clean git working tree before running, so the Phase 2 changes were
committed first.

### Command run

```bash
ng update @angular-eslint/schematics@19
```

### Version changes

| Package                                  | Before  | After   |
| ---------------------------------------- | ------- | ------- |
| `@angular-eslint/builder`                | ^18.4.3 | ^19.8.1 |
| `@angular-eslint/eslint-plugin`          | ^18.4.3 | ^19.8.1 |
| `@angular-eslint/eslint-plugin-template` | ^18.4.3 | ^19.8.1 |
| `@angular-eslint/schematics`             | ^18.4.3 | ^19.8.1 |
| `@angular-eslint/template-parser`        | ^18.4.3 | ^19.8.1 |

### No `.eslintrc.json` changes required

ESLint 8 with `.eslintrc.json` format is fully supported by `@angular-eslint` v19.
`@angular-eslint/prefer-standalone` is now on by default in the recommended config, but
`.eslintrc.json` already explicitly disables it (`"@angular-eslint/prefer-standalone": "off"`),
so no change was needed.

### Commit

```
feat: upgrade @angular-eslint 18 → 19
```

---

## Step 4 — PrimeNG and PrimeFlex Upgrade

### Why PrimeFlex 4 was required

The official `primeflex.org/installation` documentation explicitly requires PrimeFlex 4 for
PrimeNG v18 and newer. PrimeNG 19 themes define CSS custom properties under the `--p-*`
namespace (`--p-text-color`, `--p-surface-*`, `--p-text-muted-color`). They no longer define the
old names (`--text-color`, `--surface-ground`, `--surface-border`) that PrimeFlex 3 utility
classes reference internally. Using PrimeFlex 3 with PrimeNG 19 would cause utility classes such
as `text-color-secondary` and `surface-ground` to silently render with no colour.

### Command run

```bash
npm install primeng@^19 @primeng/themes@^19 primeflex@^4
```

### Version changes

| Package           | Before  | After   |
| ----------------- | ------- | ------- |
| `primeng`         | ^18.0.0 | ^19.1.4 |
| `@primeng/themes` | ^18.0.0 | ^19.1.4 |
| `primeflex`       | ^3.3.1  | ^4.0.0  |

### Notable: @primeng/themes deprecation

`@primeng/themes@^19.1.4` is marked deprecated on npm:

```
npm WARN deprecated @primeng/themes@19.1.4: Deprecated. This package is no longer maintained.
Please migrate to @primeuix/themes.
```

This is a forward-looking notice, not a breaking change. All imports (`definePreset`,
`@primeng/themes/nora`) continue to resolve correctly. Migration to `@primeuix/themes` is
a future task.

### No source code changes in this step

The PrimeNG 19 theming API is unchanged from v18:

- `import { definePreset } from '@primeng/themes'` — still valid
- `import Nora from '@primeng/themes/nora'` — still valid
- `providePrimeNG({ theme: { preset, options: { darkModeSelector, cssLayer } } })` — unchanged
- All CSS classes used in `resources.min.scss` — all unchanged in PrimeNG 19
- `ToastMessageOptions`, `MenuItem` — unchanged

All HTML templates are also unaffected by PrimeFlex 4. The `text-color-secondary`, `flex`,
and `gap-2` classes all exist unchanged in v4. `resources.min.scss` and `theme.scss` use
project-owned CSS custom properties (defined in `theme.scss`'s `:root` block) rather than
PrimeFlex-owned variables, so they are unaffected by the namespace change.

### Commit

```
feat: upgrade PrimeNG 18 → 19 and PrimeFlex 3 → 4
```

---

## Step 5 — Breaking Change Fix: `TableRowSelectEvent` Type

### Root cause

Running `npm run build:prod` after Step 4 produced two compile errors:

```
[ERROR] NG5: Argument of type 'TableRowSelectEvent<Employee>' is not assignable to parameter
of type '{ data?: Employee | undefined }'.
  Types of property 'data' are incompatible.
    Type 'Employee | Employee[] | undefined' is not assignable to type 'Employee | undefined'.
      Type 'Employee[]' is missing the following properties from type 'Employee': id, name,
      email, department, and 8 more.
```

**PrimeNG 19 changed the `data` property of `TableRowSelectEvent<T>`** from `T | undefined`
to `T | T[] | undefined`. This broader union accommodates both single-row and multi-row
selection modes. In PrimeNG 18, `data` was always `T | undefined`, so method signatures
typed as `(event: { data?: Employee })` or `(employee: Employee)` compiled cleanly.
In PrimeNG 19 they do not, because `T[]` is not assignable to `T`.

Two locations were affected.

---

### 5.1 — `employee-list.component.html` + `employee-list.component.ts`

**File:** `src/app/features/employees/employee-list/employee-list.component.html`

The Angular template was passing only the `data` property of the row-select event to the
method:

```html
<!-- Before -->
(onRowSelect)="onRowSelect($event.data)"
```

Changed to pass the whole event object, allowing the method to be typed against the proper
event interface:

```html
<!-- After -->
(onRowSelect)="onRowSelect($event)"
```

**File:** `src/app/features/employees/employee-list/employee-list.component.ts`

The method previously accepted a raw `Employee` object (because the template passed
`$event.data` directly and the type was inferred as `Employee`). Updated to accept the full
`TableRowSelectEvent<Employee>` and narrowed with `!Array.isArray` before accessing `.id`.
This guard is defensive — the table uses `selectionMode="single"` so `data` is always a single
object at runtime, but the TypeScript type is `Employee | Employee[] | undefined` regardless of
selection mode.

**Before:**

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageOptions, MenuItem } from 'primeng/api';
import { Employee } from '../../../core/models/employee.model';

// ...

onRowSelect(employee: Employee): void {
  this.router.navigate(['/employees', employee.id]);
}
```

**After:**

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastMessageOptions, MenuItem } from 'primeng/api';
import { TableRowSelectEvent } from 'primeng/table';
import { Employee } from '../../../core/models/employee.model';

// ...

onRowSelect(event: TableRowSelectEvent<Employee>): void {
  const employee = event.data;
  if (employee && !Array.isArray(employee)) {
    this.router.navigate(['/employees', employee.id]);
  }
}
```

---

### 5.2 — `showcase.component.ts`

**File:** `src/app/features/showcase/showcase.component.ts`

The method was typed with an inline object type `{ data?: Employee }`. This matched
`TableRowSelectEvent` in PrimeNG 18 (where `data` was `Employee | undefined`) but fails in
PrimeNG 19 (where `data` is `Employee | Employee[] | undefined`).

**Before:**

```typescript
import { Component, OnInit } from '@angular/core';
import { ToastMessageOptions } from 'primeng/api';
import { Employee } from '../../core/models/employee.model';

// ...

onRowSelect(event: { data?: Employee }): void {
  // Row selected event handler
  if (event.data) {
    this.selectedEmployee = event.data;
  }
}
```

**After:**

```typescript
import { Component, OnInit } from '@angular/core';
import { ToastMessageOptions } from 'primeng/api';
import { TableRowSelectEvent } from 'primeng/table';
import { Employee } from '../../core/models/employee.model';

// ...

onRowSelect(event: TableRowSelectEvent<Employee>): void {
  // Row selected event handler
  if (event.data && !Array.isArray(event.data)) {
    this.selectedEmployee = event.data;
  }
}
```

### Commit

```
fix: update TableRowSelectEvent type for PrimeNG 19 compatibility
```

---

## Step 6 — Clean Reinstall

### Why

After multiple sequential `ng update` and `npm install` calls, the `node_modules` directory can
contain stale packages or inconsistent package versions. A clean reinstall ensures the lockfile
and installed packages are fully consistent.

### Command run

```bash
rm -rf node_modules
npm install
```

---

## Step 7 — Final Verification

### Commands run

```bash
npx tsc --noEmit
npm run lint
npm test -- --watch=false
npm run build:prod
```

### Results

| Check                  | Result                               |
| ---------------------- | ------------------------------------ |
| TypeScript compilation | **0 errors**                         |
| Lint                   | **All files pass**                   |
| Unit tests             | **43/43 PASS**                       |
| Production build       | **SUCCESS** — 1.56 MB initial bundle |

The bundle grew from 1.54 MB (pre-migration) to 1.56 MB (+20 kB). This is expected due to the
additional PrimeFlex 4 CSS. Both are above the `maximumWarning: 1.5mb` budget threshold in
`angular.json`, which was already exceeded before the migration. This is a warning only — the
error threshold is `2mb` and the build does not fail.

Sass deprecation warnings about `color.adjust` appear during the build. These come from
`resources.min.scss` using a Sass built-in function that is deprecated in Dart Sass 3 (not yet
released). They are warnings only and do not affect the runtime CSS output.

---

## Summary of All Changes

| Commit    | Files Changed                                                                         | Description                                        |
| --------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `f7aa7ca` | `package.json`, `package-lock.json`, 6 component `.ts` files                          | Angular 19 upgrade + `standalone: false` schematic |
| `81ec270` | `package.json`, `package-lock.json`                                                   | @angular-eslint v19 upgrade                        |
| `2bd286c` | `package.json`, `package-lock.json`                                                   | PrimeNG 19 + PrimeFlex 4 upgrade                   |
| `6db2c0f` | `employee-list.component.html`, `employee-list.component.ts`, `showcase.component.ts` | TableRowSelectEvent type fix                       |

**Total source files modified (excluding package files):** 9

- 6 components: `standalone: false` added by schematic
- 2 components: additional `TableRowSelectEvent` type import + method signature
- 1 template: `$event.data` → `$event` binding change

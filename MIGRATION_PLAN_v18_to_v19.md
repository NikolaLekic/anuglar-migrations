# Migration Plan: Angular 18 → 19

## Goal

Upgrade the project from Angular 18 to Angular 19 in the safest way possible.
Strictly upgrades and breaking-change fixes only — no unnecessary code modernisation,
no architectural changes, no migration to standalone components.

---

## Dependency Compatibility Matrix

| Package                         | From    | To        | Notes                                                                   |
| ------------------------------- | ------- | --------- | ----------------------------------------------------------------------- |
| `@angular/*` (all)              | ^18.2.0 | ^19.2.20  | via `ng update`                                                         |
| `@angular/cli`                  | ^18.2.0 | ^19.2.22  | via `ng update`                                                         |
| `@angular-devkit/build-angular` | ^18.2.0 | ^19.2.22  | via `ng update`                                                         |
| `typescript`                    | ~5.4.2  | ~5.8.3    | **HARD BLOCKER** — Angular 19 requires TS >=5.5; `ng update` handles it |
| `zone.js`                       | ~0.14.3 | ~0.15.1   | **REQUIRED** peer dependency for Angular 19; `ng update` handles it     |
| `@angular-eslint/*` (all 5)     | ^18.0.0 | ^19.8.1   | via `ng update @angular-eslint/schematics@19`                           |
| `eslint`                        | ^8.57.1 | no change | ESLint 8 is still fully supported by @angular-eslint 19                 |
| `@typescript-eslint/*`          | ^8.57.0 | no change | satisfies @angular-eslint 19 peer deps as-is                            |
| `primeng`                       | ^18.0.0 | ^19.1.4   | manual `npm install`                                                    |
| `@primeng/themes`               | ^18.0.0 | ^19.1.4   | manual `npm install`                                                    |
| `primeflex`                     | ^3.3.1  | ^4.0.0    | **REQUIRED** — see PrimeFlex section                                    |
| `primeicons`                    | ^6.0.1  | no change | v7 has new icons but is not required for PrimeNG 19                     |
| `rxjs`                          | ~7.8.0  | no change | compatible                                                              |
| `tslib`                         | ^2.3.0  | no change | compatible                                                              |
| All dev tools                   | —       | no change | concurrently, json-server, karma, jasmine — no Angular coupling         |

---

## PrimeFlex 3 → 4

### Why PrimeFlex 4 is required (not optional)

The official `primeflex.org/installation` page states the compatibility split explicitly:

- **PrimeNG v18 and newer → PrimeFlex 4.x.x**
- **PrimeNG v17 and older → PrimeFlex 3.x.x**

PrimeNG 19 themes define CSS custom properties as `--p-text-color`, `--p-surface-*`,
`--p-text-muted-color`, etc. PrimeNG 19 themes do **not** define the old-style names
(`--text-color`, `--surface-ground`, `--surface-border`) that PrimeFlex 3 utility classes
reference. Using PrimeFlex 3 with PrimeNG 19 causes `text-color-secondary`, `surface-ground`,
and related utility classes to silently render with no colour values.

### Breaking changes in PrimeFlex 4

**The only breaking change is the CSS custom property namespace.** All class names are preserved.

| PrimeFlex 3 Variable                                                          | PrimeFlex 4 Variable                         |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| `--text-color`                                                                | `--p-text-color`                             |
| `--text-color-secondary`                                                      | `--p-text-muted-color` _(name also changed)_ |
| `--surface-0` … `--surface-900`                                               | `--p-surface-0` … `--p-surface-900`          |
| `--surface-ground`                                                            | eliminated — computed via `light-dark()`     |
| `--surface-border`                                                            | eliminated — computed via `light-dark()`     |
| `--surface-card`, `--surface-section`, `--surface-hover`, `--surface-overlay` | eliminated                                   |
| `--blue-500` etc. (all colour families)                                       | `--p-blue-500` etc.                          |
| `--primary-color`                                                             | `--p-primary-color`                          |

### Impact on this project

All HTML utility class names (`flex`, `gap-2`, `text-color-secondary`, etc.) are unchanged in v4.

The project's `resources.min.scss` and `theme.scss` use a project-owned `:root` token system
(e.g., `--surface-ground: #f1f5f9`, `--text-color-secondary: #64748b`). PrimeFlex 4 does not
break these — they are independently defined and unaffected by the upgrade.

The `text-color-secondary` class in HTML templates will resolve via `--p-text-muted-color`
(PrimeNG 19 Nora token) rather than the local `theme.scss` token. Both resolve to the same
Slate-500 tone under the configured surface palette — visually identical.

---

## Angular 19 Breaking Changes

### Critical: `standalone: false` required on all NgModule declarations

Angular 19 changed the default value of `standalone` in `@Component`, `@Directive`, and `@Pipe`
from `false` to `true`. Any class in `@NgModule.declarations` without explicit `standalone: false`
will default to standalone — and standalone classes cannot be in `declarations`, causing a
compile error.

All 6 components need `standalone: false` added:

| File                                                                      | Component                 |
| ------------------------------------------------------------------------- | ------------------------- |
| `src/app/app.component.ts`                                                | `AppComponent`            |
| `src/app/shared/layout/header/header.component.ts`                        | `HeaderComponent`         |
| `src/app/shared/layout/main-layout/main-layout.component.ts`              | `MainLayoutComponent`     |
| `src/app/features/employees/employee-list/employee-list.component.ts`     | `EmployeeListComponent`   |
| `src/app/features/employees/employee-detail/employee-detail.component.ts` | `EmployeeDetailComponent` |
| `src/app/features/showcase/showcase.component.ts`                         | `ShowcaseComponent`       |

**The `ng update @angular/core@19 @angular/cli@19` migration schematic handles this automatically.**
Do not add `standalone: false` manually before running `ng update`.

### What `ng update @angular/core@19 @angular/cli@19` does automatically

- Bumps all `@angular/*` packages
- Bumps `@angular-devkit/build-angular`
- Bumps `zone.js` and `typescript`
- Runs the `standalone-false` migration schematic on all 6 component decorators
- Runs `ExperimentalPendingTasks → PendingTasks` migration (no-op if not used)

### @angular-eslint v19: one rule to be aware of

`@angular-eslint/prefer-standalone` is now **on by default** in the recommended config.
`.eslintrc.json` already explicitly disables it on line 17:

```json
"@angular-eslint/prefer-standalone": "off"
```

No change required here.

---

## PrimeNG 18 → 19 Breaking Changes

### API: nothing changes for this project

| Item                                                                             | Status        |
| -------------------------------------------------------------------------------- | ------------- |
| `import { definePreset } from '@primeng/themes'`                                 | Unchanged     |
| `import Nora from '@primeng/themes/nora'`                                        | Unchanged     |
| `providePrimeNG({ theme: { preset, options: { darkModeSelector, cssLayer } } })` | Unchanged     |
| `import { ToastMessageOptions, MenuItem } from 'primeng/api'`                    | Unchanged     |
| All CSS class names used in `resources.min.scss`                                 | All unchanged |
| All NgModule imports (TableModule, MessagesModule, etc.)                         | All unchanged |

### Type change requiring a code fix

`TableRowSelectEvent.data` was expanded from `T | undefined` to `T | T[] | undefined`.

Any method accepting `{ data?: T }` or `(employee: T)` from a table row-select event binding
will fail to compile in PrimeNG 19. Fix by importing `TableRowSelectEvent<T>` from `primeng/table`
and using it as the parameter type, with an `!Array.isArray` guard before accessing properties.

Affected in this project:

- `employee-list.component.ts` — `onRowSelect(employee: Employee): void`
- `showcase.component.ts` — `onRowSelect(event: { data?: Employee }): void`

### `@primeng/themes` deprecation notice

`@primeng/themes@^19.1.4` is the last version of this package. It is now deprecated on npm
with a pointer to `@primeuix/themes`. The package continues to work — all imports resolve
correctly. Migration to `@primeuix/themes` is a future task, not required for this upgrade.

---

## Step-by-Step Execution

### Pre-flight

```bash
npm test -- --watch=false   # all tests must pass
npm run build:prod           # must succeed
```

Create a git checkpoint if there are any uncommitted changes.

---

### Phase 1 — Angular Core and CLI

> **Windows EPERM note:** Close any running dev server before running `ng update`.
> If it fails with EPERM, delete `node_modules`, apply `package.json` changes manually,
> then run `npm install`. (Same workaround used in the v17→v18 migration.)

```bash
ng update @angular/core@19 @angular/cli@19
```

Verify `standalone: false` was added to all 6 component decorators. Example:

```typescript
@Component({
  selector: 'app-root',
  standalone: false,         // ← added by schematic
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
```

Commit the changes before proceeding (required by `ng update` for the next phase).

---

### Phase 2 — Verify TypeScript

```bash
npx tsc --version
# Expected: 5.5.x or higher (ng update may install 5.8.x — also compatible)
```

If not upgraded automatically:

```bash
npm install typescript@~5.5.4 --save-dev
```

---

### Phase 3 — @angular-eslint

```bash
ng update @angular-eslint/schematics@19
```

Updates all 5 `@angular-eslint/*` packages. No `.eslintrc.json` changes needed.

Commit the changes before proceeding.

---

### Phase 4 — PrimeNG and PrimeFlex

```bash
npm install primeng@^19 @primeng/themes@^19 primeflex@^4
```

No source code changes needed at this point for theming, CSS classes, or imports.

---

### Phase 5 — Fix `TableRowSelectEvent` type (required breaking change)

After the PrimeNG 19 install, `npm run build:prod` will fail with:

```
NG5: Argument of type 'TableRowSelectEvent<T>' is not assignable to parameter of type
'{ data?: T | undefined }'. Types of property 'data' are incompatible.
Type 'T | T[] | undefined' is not assignable to type 'T | undefined'.
```

**Fix template binding** — change `$event.data` to `$event`:

```html
<!-- Before -->
(onRowSelect)="onRowSelect($event.data)"
<!-- After -->
(onRowSelect)="onRowSelect($event)"
```

**Fix component method** — import and use `TableRowSelectEvent<T>`, add array guard:

```typescript
import { TableRowSelectEvent } from 'primeng/table';

// Before
onRowSelect(employee: Employee): void {
  this.router.navigate(['/employees', employee.id]);
}

// After
onRowSelect(event: TableRowSelectEvent<Employee>): void {
  const employee = event.data;
  if (employee && !Array.isArray(employee)) {
    this.router.navigate(['/employees', employee.id]);
  }
}
```

For showcase (event passed whole):

```typescript
// Before
onRowSelect(event: { data?: Employee }): void {
  if (event.data) { this.selectedEmployee = event.data; }
}

// After
onRowSelect(event: TableRowSelectEvent<Employee>): void {
  if (event.data && !Array.isArray(event.data)) {
    this.selectedEmployee = event.data;
  }
}
```

---

### Phase 6 — Clean Reinstall

```bash
rm -rf node_modules
npm install
```

---

### Phase 7 — Verification

```bash
npx tsc --noEmit          # must return 0 errors
npm run lint               # must return 0 errors
npm test -- --watch=false  # all tests must pass
npm run build:prod         # must succeed
```

Manual visual check (`npm run start:all`):

- Employee list loads with data and a success message
- Table row click navigates to employee detail
- Status tags show correct green/amber/red colours
- Breadcrumb shows correctly on detail page
- Buttons are indigo (not emerald)
- All message icons are correct (not all showing info icon)
- Employee ID, email, and join date columns render in muted grey tone

---

## Files Changed Summary

| File                                                                      | Change                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------- |
| `package.json`                                                            | Version bumps (by `ng update` and `npm install`)          |
| `src/app/app.component.ts`                                                | `standalone: false` added                                 |
| `src/app/shared/layout/header/header.component.ts`                        | `standalone: false` added                                 |
| `src/app/shared/layout/main-layout/main-layout.component.ts`              | `standalone: false` added                                 |
| `src/app/features/employees/employee-list/employee-list.component.ts`     | `standalone: false` added; `TableRowSelectEvent` type fix |
| `src/app/features/employees/employee-list/employee-list.component.html`   | `$event.data` → `$event` on row select binding            |
| `src/app/features/employees/employee-detail/employee-detail.component.ts` | `standalone: false` added                                 |
| `src/app/features/showcase/showcase.component.ts`                         | `standalone: false` added; `TableRowSelectEvent` type fix |

All other files (modules, templates, SCSS, configs) — no changes.

---

## What This Migration Does NOT Do

- Does not migrate components to standalone architecture
- Does not replace `HttpClientModule` with `provideHttpClient()`
- Does not upgrade PrimeFlex to v4 beyond what is required
- Does not migrate ESLint to flat config
- Does not replace `BrowserAnimationsModule` with `provideAnimations()`
- Does not migrate `@primeng/themes` to `@primeuix/themes`

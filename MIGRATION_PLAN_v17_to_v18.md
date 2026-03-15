# Angular 17 → 18 Migration Plan

## Overview

This document is the step-by-step migration guide for `ai-app` from Angular 17 to Angular 18.
The goal is **minimum-risk, upgrade-only**: bump versions, fix breaking changes, update renamed
CSS classes. No code modernisation, no standalone migration, no refactoring beyond what Angular 18
strictly requires.

---

## Pre-migration Checklist

| Check | Command |
|---|---|
| All tests passing | `npm test -- --watch=false` |
| No lint errors | `npm run lint` |
| Clean build | `npm run build` |
| Working tree clean | `git status` |

> Commit (or stash) everything before starting. Each phase below should be its own commit so you
> can `git revert` any single phase if something goes wrong.

---

## Compatibility Matrix

| Package | Current (v17) | Target (v18) | Notes |
|---|---|---|---|
| `@angular/core` | `~17.3.x` | `^18.2.x` | Same NgModule API |
| `@angular/cli` | `~17.3.x` | `^18.2.x` | |
| `@angular-devkit/build-angular` | `~17.3.x` | `^18.2.x` | |
| `@angular-eslint/*` | `^17.x` | `^18.x` | Add `prefer-standalone: off` |
| `typescript` | `~5.4.2` | `~5.4.2` | **No change** — v18 still targets TS 5.4 |
| `zone.js` | `~0.14.x` | `~0.14.x` | **No change** |
| `primeng` | `^17.18.11` | `^18.x` | **Major theming overhaul** — see Phase 3 |
| `@primeng/themes` | _(not installed)_ | `^18.x` | New package required by PrimeNG 18 |
| `primeicons` | `^6.0.1` | `^6.0.1` | **No change** — PrimeNG 18 still uses v6 |
| `primeflex` | `^3.3.1` | `^3.3.1` | **No change** — PrimeFlex 3.x is compatible |
| `json-server` | `^0.17.4` | `^0.17.4` | **No change** — dev tool only |
| `concurrently` | `^8.2.2` | `^8.2.2` | **No change** — dev tool only |
| Node.js | `>=18.x` | `>=18.19.1` | Minimum raised; verify with `node -v` |

---

## Phase 1 — Angular Core + CLI + Build + ESLint

### 1.1 Verify Node.js version

```bash
node -v
```

Angular 18 requires **Node.js >= 18.19.1**. If you are on an earlier patch, update Node before
proceeding.

### 1.2 Run `ng update` for Angular packages

Use the built-in migration tool — it rewrites code for known breaking changes automatically:

```bash
npx @angular/cli@18 update @angular/core@18 @angular/cli@18
```

The schematic will:
- Bump all `@angular/*` package versions in `package.json`
- Remove the now-deleted `RouterLinkWithHref` directive (replaced by `RouterLink` directly —
  no action required in our templates because we already use `routerLink` attribute binding)
- Warn about deprecated APIs

> **Windows workaround — EPERM / TAR_ENTRY_ERROR:**
> On Windows, `npx @angular/cli@18 update` can fail with npm cache corruption errors
> (`EPERM`, `TAR_ENTRY_ERROR`, `ENOTEMPTY`). If this happens, manually edit `package.json`
> to bump all `@angular/*` packages and `@angular-devkit/build-angular` to their target
> versions (see Compatibility Matrix), then run:
>
> ```bash
> npm install --legacy-peer-deps
> ```
>
> The `--legacy-peer-deps` flag is necessary because some packages (e.g. `@angular-eslint@17.x`
> still in `node_modules`) will conflict with the new `@angular/core@18` peer requirement
> until you also upgrade them in Phase 1.4.

### 1.3 Update build tooling

```bash
npm install --save-dev @angular-devkit/build-angular@^18.2.0
```

### 1.4 Update `@angular-eslint` and `@typescript-eslint`

```bash
npm install --save-dev \
  @angular-eslint/builder@^18.0.0 \
  @angular-eslint/eslint-plugin@^18.0.0 \
  @angular-eslint/eslint-plugin-template@^18.0.0 \
  @angular-eslint/template-parser@^18.0.0
```

> **Breaking: `@typescript-eslint` must be at v8** — `@angular-eslint@18` depends on
> `@typescript-eslint/utils` which is only distributed at v8. Installing `@angular-eslint@18`
> while `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` remain at v7 causes
> a module-resolution conflict that prevents ESLint from loading any Angular plugin rule.
>
> After updating `@angular-eslint`, upgrade all three `@typescript-eslint` packages together:
>
> ```bash
> npm install --save-dev \
>   @typescript-eslint/eslint-plugin@^8.0.0 \
>   @typescript-eslint/parser@^8.0.0 \
>   @typescript-eslint/utils@^8.0.0
> ```
>
> All three must be on the **same major version**. The `@typescript-eslint/utils` package is an
> explicit peer dependency of `@angular-eslint/utils@18` and must be installed directly.

### 1.5 Disable the new `prefer-standalone` rule in `.eslintrc.json`

Angular 18's ESLint plugin ships a new rule `@angular-eslint/prefer-standalone` that warns when
components/pipes/directives are not standalone. This project intentionally uses NgModules, so the
rule must be turned off.

Open `.eslintrc.json` and add to the `"rules"` block inside the `*.ts` override:

```json
"@angular-eslint/prefer-standalone": "off"
```

Full updated rules section (additions marked with `// NEW`):

```json
"rules": {
  "@angular-eslint/prefer-standalone": "off",                       // NEW
  "@angular-eslint/component-selector": ["error", { "type": "element", "prefix": "app", "style": "kebab-case" }],
  "@angular-eslint/directive-selector": ["error", { "type": "attribute", "prefix": "app", "style": "camelCase" }],
  "@angular-eslint/no-empty-lifecycle-method": "error",
  "@angular-eslint/use-lifecycle-interface": "error",
  "@angular-eslint/no-input-rename": "error",
  "@angular-eslint/no-output-rename": "error",
  "@typescript-eslint/explicit-function-return-type": ["warn", { "allowExpressions": true }],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "@typescript-eslint/prefer-readonly": "error",
  "no-console": ["warn", { "allow": ["warn", "error"] }]
}
```

### 1.6 Verify build and tests still pass

```bash
npm run build
npm test -- --watch=false
npm run lint
```

Fix any issues before moving to Phase 2.

**Commit: `chore: upgrade Angular 17 → 18 core, CLI, ESLint`**

---

## Phase 2 — Breaking Changes From Angular Core

> These were verified against the project's source. Both items are either already handled or not
> used.

### 2.1 `RouterLinkWithHref` removed

`RouterLinkWithHref` was deprecated in v15 and removed in v18. The `ng update` schematic
(Phase 1.2) handles this automatically. Our templates never import or reference it directly, so
no manual changes are needed.

### 2.2 `CanLoad` removed

`CanLoad` was deprecated in v15 and removed in v18. Our `app-routing.module.ts` does **not** use
`CanLoad` — it only uses `loadChildren` without guards — so no action required.

### 2.3 `BrowserTransferStateModule` removed

Removed in v18. We do not import it anywhere, so no action required.

### 2.4 `RouterTestingModule` deprecated (not removed)

`RouterTestingModule` is deprecated in v18 but **not removed** (it still works). Our
`app.component.spec.ts` uses it. No change is required at this stage. It can be replaced with
`provideRouter()` in a future cleanup, but that is out of scope here.

---

## Phase 3 — PrimeNG 17 → 18 (Major Theming Overhaul)

This is the most impactful part of the migration. PrimeNG 18 completely replaced its CSS
theming architecture.

### What changed

| Area | PrimeNG 17 | PrimeNG 18 |
|---|---|---|
| Structural base CSS | `primeng/resources/primeng.min.css` | Bundled into the component JS — **file no longer exists** |
| Theme CSS | `primeng/resources/themes/*/theme.css` | `@primeng/themes` npm package with JS presets |
| Theme activation | Import CSS file in `angular.json` | Call `providePrimeNG({ theme: ... })` in `AppModule` providers |
| `primeflex` | 3.3.1 — separate package | **No change** — PrimeFlex 3.x is still compatible with PrimeNG 18 |

### 3.1 Install updated packages

```bash
npm install primeng@^18.0.0 @primeng/themes@^18.0.0
```

`primeicons` stays at `^6.0.1` — PrimeNG 18 still ships with PrimeIcons 6.

### 3.2 Remove `primeng.min.css` from `angular.json`

Open `angular.json` and **remove** this line from the `styles` array:

```json
"node_modules/primeng/resources/primeng.min.css",
```

The file no longer exists in the PrimeNG 18 package. Leaving the reference will cause a build
error.

The `styles` array should become:

```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "node_modules/primeflex/primeflex.css",
  "src/assets/styles/theme.scss",
  "src/assets/styles/resources.min.scss",
  "src/styles.scss"
]
```

### 3.3 Add `providePrimeNG()` with `AppPreset` and `cssLayer` to `AppModule`

PrimeNG 18 requires a provider call to register the theme at bootstrap time. Two additions
are required beyond the minimal `{ preset: Nora }` call:

**Why `definePreset` is required (not optional):**
Nora's default primary palette is **Emerald (#10b981)**, not Indigo (#4f46e5). Without
overriding the primary token, focus rings, selected table rows, active paginator pages, and
all highlight states will be emerald green — a direct visual regression.

**Why `cssLayer` is required (not optional):**
PrimeNG 18 appends component `<style>` tags to `<head>` at runtime via `HEAD.appendChild`,
placing them *after* Angular's compiled stylesheets. This gives PrimeNG higher CSS source
order. The `cssLayer` option wraps all PrimeNG styles in `@layer primeng { }` — CSS layers
always lose to non-layered rules, so every rule in `resources.min.scss` wins unconditionally
with no specificity changes needed.

Open `src/app/app.module.ts` and replace with:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Nora from '@primeng/themes/nora';           // default export — NOT named
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

// Override Nora's default Emerald primary with our Indigo palette,
// and align surface tokens with the project's $surface-* variables.
// Severity colors (success/info/warn/danger) are NOT overridden here —
// they vary per component in PrimeNG 18's token structure and are handled
// more precisely by the existing class overrides in resources.min.scss.
const AppPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50:  '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',   // #4f46e5 — our $primary
      600: '{indigo.600}',   // #4338ca
      700: '{indigo.700}',   // #3730a3 — our $primary-dark
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.500}',   // #4f46e5
          contrastColor: '#ffffff',
          hoverColor:    '{primary.700}',   // #3730a3
          activeColor:   '{primary.700}',
        },
        // Slate surface scale matches our $surface-b/c/d variables exactly
        surface: {
          0:   '#ffffff',
          50:  '{slate.50}',    // #f8fafc  = $surface-b
          100: '{slate.100}',   // #f1f5f9  = $surface-c / $surface-ground
          200: '{slate.200}',   // #e2e8f0  = $surface-d / $surface-border
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',   // #64748b  = $text-secondary
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',   // #1e293b  = $text-color
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
    },
  },
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  providers: [
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: false,   // no dark mode in this app
          // Wraps all PrimeNG component styles in @layer primeng { }.
          // CSS layers always lose to non-layered rules, so resources.min.scss
          // wins unconditionally regardless of runtime injection order.
          cssLayer: {
            name: 'primeng',
            order: 'primeng',
          },
        },
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 3.4 Why `resources.min.scss` is kept unchanged

With `cssLayer` active, ALL existing class overrides in `resources.min.scss` win
unconditionally. No lines need to be removed. The file continues to handle:

| Area | Reason for keeping |
|---|---|
| Button severity colors (success/info/warn/danger) | Severity tokens in PrimeNG 18 are per-component, use different color scales (`sky` vs `blue`, `orange` vs `yellow`), and would require overriding 5+ components individually |
| Message border-left 4px design | Custom design decision not expressed in any PrimeNG token |
| Button/card/tag padding, font-size, border-radius | Structural refinements beyond token scope |
| Breadcrumb layout | Structural; no token equivalent |
| Table row padding, hover state | Structural refinements |

**Commit: `chore: upgrade PrimeNG 17 → 18, AppPreset with definePreset + cssLayer`**

---

## Phase 4 — CSS Class Renames in `resources.min.scss`

PrimeNG 18 renamed several internal CSS classes across components. Our `resources.min.scss`
targets these classes directly, so each rename must be updated.

Open `src/assets/styles/resources.min.scss` and apply all changes below.

### 4.1 Breadcrumb

| Old class | New class |
|---|---|
| `.p-menuitem-link` | `.p-breadcrumb-item-link` |
| `.p-menuitem-text` | `.p-breadcrumb-item-label` |
| `.p-menuitem-icon` | `.p-breadcrumb-item-icon` |
| `.p-breadcrumb-chevron` | `.p-breadcrumb-separator` |

Find the `.p-breadcrumb` block and update the nested selectors:

```scss
// BEFORE
.p-breadcrumb {
  ul li {
    .p-menuitem-link { ... }
    .p-menuitem-link .p-menuitem-text { ... }
    .p-menuitem-link .p-menuitem-icon { ... }
    &.p-breadcrumb-chevron { ... }
    &:last-child .p-menuitem-link .p-menuitem-text { ... }
  }
}

// AFTER
.p-breadcrumb {
  ul li {
    .p-breadcrumb-item-link { ... }
    .p-breadcrumb-item-link .p-breadcrumb-item-label { ... }
    .p-breadcrumb-item-link .p-breadcrumb-item-icon { ... }
    &.p-breadcrumb-separator { ... }
    &:last-child .p-breadcrumb-item-link .p-breadcrumb-item-label { ... }
  }
}
```

### 4.2 Messages

| Old class | New class |
|---|---|
| `.p-message-wrapper` | `.p-message-content` |
| `.p-message-close` | `.p-message-close-button` |

Find the `.p-messages .p-message` block and update:

```scss
// BEFORE
.p-message-wrapper { padding: 0.75rem 1rem; ... }
.p-message-close { opacity: 0.6; ... }

// AFTER
.p-message-content { padding: 0.75rem 1rem; ... }
.p-message-close-button { opacity: 0.6; ... }
```

### 4.3 Paginator

| Old class | New class |
|---|---|
| `.p-paginator-element` | `.p-paginator-page`, `.p-paginator-next`, `.p-paginator-prev`, `.p-paginator-first`, `.p-paginator-last` |
| `.p-highlight` (inside paginator) | `.p-paginator-page-selected` |
| `.p-paginator-current` | `.p-paginator-content-start` / `.p-paginator-content-end` (for text slot) |

The safest update replaces `.p-paginator-element` with the shared attribute selector that covers
all button types, and replaces the paginator-specific `.p-highlight`:

```scss
// BEFORE
.p-paginator {
  .p-paginator-element { ... }
  .p-paginator-element.p-highlight { ... }
  .p-paginator-current { ... }
}

// AFTER
.p-paginator {
  // Covers all navigation buttons (first, prev, page numbers, next, last)
  .p-paginator-first,
  .p-paginator-prev,
  .p-paginator-page,
  .p-paginator-next,
  .p-paginator-last { ... }

  .p-paginator-page-selected { ... }

  .p-paginator-content-start,
  .p-paginator-content-end { color: var(--text-color-secondary); font-size: 0.8125rem; }
}
```

### 4.4 Table — sortable column header

| Old class | New class |
|---|---|
| `.p-sortable-column` | `.p-datatable-sortable-column` |
| `.p-sortable-column-icon` | `.p-datatable-sort-icon` |
| `.p-highlight` on `th` | `.p-datatable-column-sorted` |

Find the `thead > tr > th` block and update:

```scss
// BEFORE
&.p-sortable-column { ... }
&.p-sortable-column:hover { ... }
&.p-sortable-column.p-highlight { ... }
&.p-sortable-column.p-highlight .p-sortable-column-icon { ... }

// AFTER
&.p-datatable-sortable-column { ... }
&.p-datatable-sortable-column:hover { ... }
&.p-datatable-sortable-column.p-datatable-column-sorted { ... }
&.p-datatable-sortable-column.p-datatable-column-sorted .p-datatable-sort-icon { ... }
```

### 4.5 Table — selected body row

| Old class | New class |
|---|---|
| `.p-highlight` on `tbody > tr` | `.p-datatable-row-selected` |

Find the `tbody > tr` block and update the selected-row rule:

```scss
// BEFORE
&.p-highlight > td {
  background: var(--surface-hover);
  color: var(--primary-color);
}

// AFTER
&.p-datatable-row-selected > td {
  background: var(--surface-hover);
  color: var(--primary-color);
}
```

**Commit: `fix: update PrimeNG 18 CSS class renames in resources.min.scss`**

### 5.1 `p-tag` severity — add `'secondary'` and `'contrast'`

PrimeNG 18 expands the `severity` input on `<p-tag>` to include two new values:
`'secondary'` and `'contrast'`. Our `getStatusSeverity()` return type union is narrower than the
new accepted set — update **both** component files.

`src/app/features/employees/employee-list/employee-list.component.ts`:

```typescript
// BEFORE
getStatusSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' {

// AFTER
getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | undefined {
```

`src/app/features/employees/employee-detail/employee-detail.component.ts` — same change.

`src/app/features/showcase/showcase.component.ts`:

```typescript
// BEFORE
getStatusSeverity(
  status: string,
): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | undefined {

// AFTER  (already matches — no change needed if already in this form)
getStatusSeverity(
  status: string,
): 'success' | 'secondary' | 'info' | 'warning' | 'danger' | undefined {
```

**Commit: `fix: update p-tag severity union type for PrimeNG 18`**

---

## Phase 5b — PrimeNG 18 Renamed `Message` → `ToastMessageOptions`

PrimeNG 18 **renamed the `Message` interface** (used for the `[(value)]` binding on `<p-messages>`)
to `ToastMessageOptions`. The old name is no longer exported from `primeng/api`.

Any component that declares a `messages` array typed as `Message[]` will fail to compile:

```
error TS2724: Module '"primeng/api"' has no exported member 'Message'.
Did you mean 'ToastMessageOptions'?
```

### What to update

Search for `import { Message` (or `import { ..., Message, ...`) from `primeng/api` across all
component files. Replace both the import and the type annotation.

**Pattern — applies to every component that uses `<p-messages>`:**

```typescript
// BEFORE
import { Message, MenuItem } from 'primeng/api';
// ...
messages: Message[] = [];

// AFTER
import { ToastMessageOptions, MenuItem } from 'primeng/api';
// ...
messages: ToastMessageOptions[] = [];
```

**Files to update in this project:**

| File | Change |
|---|---|
| `employee-list.component.ts` | `Message[]` → `ToastMessageOptions[]` |
| `employee-detail.component.ts` | `Message[]` → `ToastMessageOptions[]` |
| `showcase.component.ts` | All five `Message[]` arrays → `ToastMessageOptions[]` |

> **What about `Message` from `primeng/message`?**
> The component named `Message` (the single-message component, `<p-message>`) is unaffected —
> only the data interface `Message` from `primeng/api` was renamed.

> **`<p-messages>` deprecation warning (non-breaking):**
> PrimeNG 18 logs a console warning at startup: *"Messages component is deprecated as of v18.
> Use Message component instead."* This does **not** break anything — the component still renders
> correctly. Migrating `<p-messages>` to the new `<p-message>` API is optional and out of scope
> for this upgrade.

**Commit: `fix: rename PrimeNG Message interface to ToastMessageOptions`**

---

PrimeFlex **3.3.1 is fully compatible with PrimeNG 18**. PrimeFlex is a standalone utility CSS
library — it has no runtime coupling to PrimeNG's component layer or theming system. No version
bump or configuration change is needed.

PrimeFlex 4.x exists as an open beta but is not yet stable enough for production use. Stay on
3.3.1.

---

## Phase 7 — Final Verification

Run all checks in order. Fix any failures before marking the migration complete.

```bash
# 1. TypeScript compiler — zero type errors
npx tsc --noEmit

# 2. Unit tests
npm test -- --watch=false

# 3. ESLint — should be clean
npm run lint

# 4. Production build — must succeed without errors
npm run build:prod

# 5. Start both servers and smoke-test manually
npm run start:all
```

### Manual smoke test checklist

| Check | Expected result |
|---|---|
| `http://localhost:4200` loads | Redirects to `/employees` |
| Employee list renders | Table shows 12 rows, paginator visible |
| Status tags display correctly | Green/red/yellow tags with correct colours |
| Breadcrumb links render | "Home" + "Employees" items styled correctly |
| Messages display correctly | Success/info/warn/error messages correctly styled |
| Row click navigates | Navigates to `/employees/:id` |
| Detail page breadcrumb | Shows employee name in final breadcrumb item |
| Detail cards render | Personal + Employment + Biography cards display |
| Back button works | Returns to list |
| Buttons styled correctly | Primary, secondary, outlined, danger, warning variants visible |
| No console errors | Browser devtools console is clean |

---

## Summary of All File Changes

| File | Change |
|---|---|
| `package.json` | `@angular/*` → `^18.2.x`, `@angular-devkit/build-angular` → `^18.2.x`, `@angular-eslint/*` → `^18.x`, `@typescript-eslint/{eslint-plugin,parser,utils}` → `^8.x`, `primeng` → `^18.x`, add `@primeng/themes: ^18.x` |
| `angular.json` | Remove `primeng/resources/primeng.min.css` from styles array |
| `src/app/app.module.ts` | Import `providePrimeNG` + `Nora` (default import), add `definePreset` with indigo/slate tokens and `cssLayer` |
| `.eslintrc.json` | Add `"@angular-eslint/prefer-standalone": "off"` to TS rules |
| `src/assets/styles/resources.min.scss` | Breadcrumb, messages, paginator, table class renames (Phase 4) |
| `src/app/features/employees/employee-list/employee-list.component.ts` | `Message[]` → `ToastMessageOptions[]`; `getStatusSeverity` return type union |
| `src/app/features/employees/employee-detail/employee-detail.component.ts` | `Message[]` → `ToastMessageOptions[]`; `getStatusSeverity` return type union |
| `src/app/features/showcase/showcase.component.ts` | Five `Message[]` arrays → `ToastMessageOptions[]` |

---

## Rollback Strategy

Each phase is a separate git commit. To roll back a specific phase:

```bash
git revert <commit-sha>
```

To roll back the entire migration:

```bash
git revert <phase-5-sha>..<phase-1-sha>
```

Or reset the branch to the pre-migration commit:

```bash
git reset --hard <pre-migration-sha>
```

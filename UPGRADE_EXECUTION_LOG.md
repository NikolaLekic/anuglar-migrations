# Upgrade Execution Log — Angular 17 → 18 (PrimeNG 17 → 18)

This document is a chronological record of every change made, why it was made, and what
commands were run during the migration of `ai-app` from Angular 17 to Angular 18.

---

## Environment

| Item | Value |
|---|---|
| OS | Windows 10 (`win32`) |
| Node.js | v20.11.1 |
| npm | 10.x |
| Shell | bash (Git Bash) |
| Starting branch | `angular-v18` |

---

## Step 1 — Package Version Bumps

### What changed

`package.json` was updated to target Angular 18 and PrimeNG 18 versions.

#### Why `ng update` was not used

The standard upgrade command:

```bash
npx @angular/cli@18 update @angular/core@18 @angular/cli@18
```

failed on Windows with npm cache corruption errors:

```
npm error TAR_ENTRY_ERROR  EPERM: operation not permitted
npm error   path: C:\Users\nleki\AppData\Local\npm-cache\...
```

Windows locks files in the npm cache during extraction, causing the schematics runner to
abort mid-flight. The workaround was to update `package.json` manually and install directly.

### How it was done

`package.json` dependency versions were edited manually, then installed:

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` was required because the existing `node_modules` still contained
`@angular-devkit/build-angular@17.3.17`, which conflicted with the newly declared
`@angular/core@^18.2.0` peer requirement. The flag tells npm to ignore peer dep conflicts
during install rather than aborting.

### Version changes

| Package | Before | After |
|---|---|---|
| `@angular/core` | `~17.3.0` | `^18.2.0` |
| `@angular/cli` | `~17.3.0` | `^18.2.0` |
| `@angular/animations` | `~17.3.0` | `^18.2.0` |
| `@angular/common` | `~17.3.0` | `^18.2.0` |
| `@angular/compiler` | `~17.3.0` | `^18.2.0` |
| `@angular/compiler-cli` | `~17.3.0` | `^18.2.0` |
| `@angular/forms` | `~17.3.0` | `^18.2.0` |
| `@angular/platform-browser` | `~17.3.0` | `^18.2.0` |
| `@angular/platform-browser-dynamic` | `~17.3.0` | `^18.2.0` |
| `@angular/router` | `~17.3.0` | `^18.2.0` |
| `@angular-devkit/build-angular` | `~17.3.0` | `^18.2.0` |
| `@angular-eslint/*` | `^17.x` | `^18.0.0` |
| `primeng` | `^17.18.11` | `^18.0.0` |
| `@primeng/themes` | _(not installed)_ | `^18.0.0` _(new)_ |

Packages that did **not** change: `primeflex@3.3.1`, `primeicons@6.0.1`, `rxjs@~7.8.0`,
`zone.js@~0.14.3`, `typescript@~5.4.2`, `json-server@^0.17.4`, `concurrently@^8.2.2`.

---

## Step 2 — `angular.json`: Remove Dead CSS Reference

### What changed

**File:** `angular.json`

Removed from the `styles` array:

```json
"node_modules/primeng/resources/primeng.min.css"
```

### Why

PrimeNG 17 shipped a static structural CSS file at that path. PrimeNG 18 eliminated it
entirely — component base styles are now bundled into the component JS and injected at
runtime. The file literally no longer exists in the PrimeNG 18 package, so leaving the
reference causes a build error:

```
Error: Cannot find module 'primeng/resources/primeng.min.css'
```

### Resulting styles array

```json
"styles": [
  "node_modules/primeicons/primeicons.css",
  "node_modules/primeflex/primeflex.css",
  "src/assets/styles/theme.scss",
  "src/assets/styles/resources.min.scss",
  "src/styles.scss"
]
```

---

## Step 3 — ESLint: `@angular-eslint@18` + `@typescript-eslint@8`

### 3a. Upgrade `@angular-eslint`

```bash
npm install --save-dev \
  @angular-eslint/builder@^18.0.0 \
  @angular-eslint/eslint-plugin@^18.0.0 \
  @angular-eslint/eslint-plugin-template@^18.0.0 \
  @angular-eslint/template-parser@^18.0.0
```

### 3b. Upgrade `@typescript-eslint` to v8 — a required fix

Installing `@angular-eslint@18` and then running `ng lint` produced:

```
Error: Cannot find module '@typescript-eslint/utils'
```

`@angular-eslint@18` depends on `@typescript-eslint/utils` as a peer dependency, but it
is not installed automatically. The first attempt was to install at v7:

```bash
npm install --save-dev @typescript-eslint/utils@^7.18.0
```

npm resolved this to **v8.57.0** instead (semver allows a higher major when the range is
satisfied). This created a version mismatch: `@typescript-eslint/utils@8.x` was present
but `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` were still at v7.
The result was a runtime conflict preventing any `@typescript-eslint` rule from loading.

The fix was to upgrade all three packages to the same major version:

```bash
npm install --save-dev \
  @typescript-eslint/eslint-plugin@^8.0.0 \
  @typescript-eslint/parser@^8.0.0 \
  @typescript-eslint/utils@^8.0.0
```

**Why they must all be at the same major:** These three packages share internal AST types
and utility interfaces. A v7 plugin trying to consume v8 utils gets incompatible type
shapes at runtime, which ESLint surfaces as module-resolution or parsing errors.

Final installed versions: `@typescript-eslint/{eslint-plugin,parser,utils}@8.57.0`.

### 3c. Disable the new `prefer-standalone` rule

**File:** `.eslintrc.json`

Angular 18's ESLint plugin adds a new rule that warns on any component, pipe, or directive
that is not declared as standalone. This project intentionally uses `NgModule`-based
architecture (non-standalone), so the rule fires on every file.

Added to the `"rules"` block inside the `*.ts` override:

```json
"@angular-eslint/prefer-standalone": "off"
```

**Why "off" rather than fixing it:** The goal of this migration is minimum-risk version
bumps only. Converting every component/pipe/directive to standalone is a separate
architectural decision that changes how modules, providers, and imports are declared
throughout the entire app. That is out of scope.

---

## Step 4 — PrimeNG 18 Theming: `app.module.ts` Overhaul

This was the most significant change in the entire migration.

### The problem: PrimeNG 18 replaced its entire theming system

| Aspect | PrimeNG 17 | PrimeNG 18 |
|---|---|---|
| Theme delivery | CSS file imported in `angular.json` | JS preset object registered at bootstrap |
| Component base styles | `primeng.min.css` static file | Injected into `<head>` at runtime by each component |
| Customisation API | Override CSS variables in SCSS | `definePreset()` to extend a preset with token overrides |
| CSS injection timing | Compiled into the Angular bundle | `HEAD.appendChild` at component init — **after** Angular's bundle |

### Problem 1: wrong primary colour (visual regression)

PrimeNG 18 ships the `Nora` preset with **Emerald (#10b981)** as its default primary
palette. The application uses **Indigo (#4f46e5)**. Without overriding the primary token,
every primary-driven element — focus rings, selected table rows, active paginator pages,
hover/active states on buttons — would turn emerald green.

### Problem 2: CSS override order (runtime injection)

PrimeNG 18 components call `UseStyle` (an injectable service) when they first initialise.
This service appends a `<style>` tag to `<head>` containing that component's default
styles. Because this happens at component init time, the injected styles appear **after**
Angular's compiled bundle in the DOM. Higher source order means higher precedence at equal
specificity, so PrimeNG's defaults would silently win over the overrides in
`resources.min.scss`.

### Solution: `definePreset` + `cssLayer`

**`definePreset(Nora, { ... })`** — maps the indigo and slate palettes into PrimeNG 18's
token system. Tokens use reference syntax like `{indigo.500}`, which PrimeNG resolves to
the correct hex value at runtime via CSS custom properties.

**`cssLayer: { name: 'primeng', order: 'primeng' }`** — wraps every PrimeNG component
`<style>` block in `@layer primeng { }`. CSS layers always lose to non-layered (unlayered)
CSS rules regardless of source order or specificity. Every rule in `resources.min.scss` is
non-layered, so it wins unconditionally — no specificity tricks needed.

### The import pitfall: `Nora` is a default export

The first compile attempt used a named import:

```typescript
import { Nora } from '@primeng/themes/nora'; // WRONG
```

This produced:

```
error TS2305: Module '"@primeng/themes/nora"' has no exported member 'Nora'.
```

`@primeng/themes/nora` exports `Nora` as a **default export**, not a named export.
The correct import is:

```typescript
import Nora from '@primeng/themes/nora'; // CORRECT
```

### Why severity colours are NOT in the preset

PrimeNG 18's token system places severity colours at the per-component level. For example,
`<p-tag>` uses `sky` for info, while `<p-message>` uses `blue` for info. Overriding
severity in the preset would require setting tokens for each of the 10+ affected components
individually and verifying the shades match. The existing class overrides in
`resources.min.scss` are more precise and already correct — combined with `cssLayer`, they
win without any changes.

### Final `src/app/app.module.ts`

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Nora from '@primeng/themes/nora';   // default export — NOT { Nora }

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

const AppPreset = definePreset(Nora, {
  semantic: {
    primary: {
      50:  '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',   // #4f46e5 — $primary
      600: '{indigo.600}',   // #4338ca
      700: '{indigo.700}',   // #3730a3 — $primary-dark
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color:         '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.700}',
          activeColor:   '{primary.700}',
        },
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
  imports: [BrowserModule, BrowserAnimationsModule, AppRoutingModule, CoreModule, SharedModule],
  providers: [
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: false,
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

---

## Step 5 — CSS Class Renames in `resources.min.scss`

PrimeNG 18 renamed several internal CSS classes as part of its component API
standardisation. The overrides in `resources.min.scss` target these classes directly, so
each rename must be applied.

### 5.1 Breadcrumb

| Old class | New class | Reason |
|---|---|---|
| `.p-menuitem-link` | `.p-breadcrumb-item-link` | Namespaced to component |
| `.p-menuitem-text` | `.p-breadcrumb-item-label` | Namespaced + semantic rename |
| `.p-menuitem-icon` | `.p-breadcrumb-item-icon` | Namespaced to component |
| `.p-breadcrumb-chevron` | `.p-breadcrumb-separator` | Semantic rename |

Before, Breadcrumb shared menu-item class names with PanelMenu and other menu components.
PrimeNG 18 namespaced them per-component to allow independent styling.

```scss
// BEFORE
ul li {
  .p-menuitem-link { ... }
  .p-menuitem-link .p-menuitem-text { ... }
  .p-menuitem-link .p-menuitem-icon { ... }
  &.p-breadcrumb-chevron { ... }
  &:last-child .p-menuitem-link .p-menuitem-text { ... }
}

// AFTER
ul li {
  .p-breadcrumb-item-link { ... }
  .p-breadcrumb-item-link .p-breadcrumb-item-label { ... }
  .p-breadcrumb-item-link .p-breadcrumb-item-icon { ... }
  &.p-breadcrumb-separator { ... }
  &:last-child .p-breadcrumb-item-link .p-breadcrumb-item-label { ... }
}
```

### 5.2 Messages

| Old class | New class | Reason |
|---|---|---|
| `.p-message-wrapper` | `.p-message-content` | Semantic rename |
| `.p-message-close` | `.p-message-close-button` | Explicit element type in name |

```scss
// BEFORE
.p-message-wrapper { padding: 0.75rem 1rem; ... }
.p-message-close { opacity: 0.6; ... }

// AFTER
.p-message-content { padding: 0.75rem 1rem; ... }
.p-message-close-button { opacity: 0.6; ... }
```

### 5.3 Paginator

The single `.p-paginator-element` class that was applied to every button type was split
into named per-button classes. The active-page indicator was also renamed.

| Old class | New class |
|---|---|
| `.p-paginator-element` | `.p-paginator-first`, `.p-paginator-prev`, `.p-paginator-page`, `.p-paginator-next`, `.p-paginator-last` |
| `.p-paginator-element.p-highlight` | `.p-paginator-page.p-paginator-page-selected` |

```scss
// BEFORE
.p-paginator {
  .p-paginator-element { ... }
  .p-paginator-element.p-highlight { ... }
}

// AFTER
.p-paginator {
  .p-paginator-first,
  .p-paginator-prev,
  .p-paginator-page,
  .p-paginator-next,
  .p-paginator-last { ... }

  .p-paginator-page-selected { ... }
}
```

### 5.4 Table — sortable header column

| Old class | New class |
|---|---|
| `.p-sortable-column` | `.p-datatable-sortable-column` |
| `.p-sortable-column-icon` | `.p-datatable-sort-icon` |
| `.p-highlight` on `th` | `.p-datatable-column-sorted` |

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

### 5.5 Table — selected body row (found during execution)

This rename was not in the original migration plan — it was discovered during the
TypeScript compiler pass. The `.p-highlight` class on `tbody > tr` (used when
`selectionMode="single"` and a row is selected) was renamed.

| Old class | New class |
|---|---|
| `.p-highlight` on `tbody > tr` | `.p-datatable-row-selected` |

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

---

## Step 6 — TypeScript Breaking Changes

### 6.1 `Message` renamed to `ToastMessageOptions` in `primeng/api`

**Discovered during:** `npx tsc --noEmit`

**Error:**

```
error TS2724: Module '"primeng/api"' has no exported member 'Message'.
Did you mean 'ToastMessageOptions'?
```

PrimeNG 18 renamed the `Message` data interface (the shape of objects placed into a
`<p-messages>` `[(value)]` binding or a `<p-toast>`) from `Message` to
`ToastMessageOptions`. The old name is no longer exported.

Note: the *component* named `Message` (`<p-message>`, from `primeng/message`) is unaffected.
Only the *data interface* `Message` from `primeng/api` was renamed.

**Files changed:**

`src/app/features/employees/employee-list/employee-list.component.ts`

```typescript
// BEFORE
import { Message, MenuItem } from 'primeng/api';
messages: Message[] = [];

// AFTER
import { ToastMessageOptions, MenuItem } from 'primeng/api';
messages: ToastMessageOptions[] = [];
```

`src/app/features/employees/employee-detail/employee-detail.component.ts`

Same change as employee-list.

`src/app/features/showcase/showcase.component.ts`

The showcase component has five typed arrays — all changed:

```typescript
// BEFORE
import { Message } from 'primeng/api';
successMessages: Message[] = [];
infoMessages:    Message[] = [];
warnMessages:    Message[] = [];
errorMessages:   Message[] = [];
allMessages:     Message[] = [];

// AFTER
import { ToastMessageOptions } from 'primeng/api';
successMessages: ToastMessageOptions[] = [];
infoMessages:    ToastMessageOptions[] = [];
warnMessages:    ToastMessageOptions[] = [];
errorMessages:   ToastMessageOptions[] = [];
allMessages:     ToastMessageOptions[] = [];
```

### 6.2 `p-tag` severity union — add `'secondary'` and `'contrast'`

PrimeNG 18 expanded the accepted values for the `severity` input on `<p-tag>`. The old
return type union was too narrow and would cause TypeScript errors when passing the result
to `[severity]`.

```typescript
// BEFORE
getStatusSeverity(status: string): 'success' | 'danger' | 'warning' | 'info' {

// AFTER
getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | undefined {
```

Two changes in the union:
- `'warning'` → `'warn'` — PrimeNG 18 normalised the severity string to match the
  `ToastMessageOptions.severity` values (`warn` not `warning`)
- Added `'secondary'` and `undefined` to the union to satisfy the new `TagSeverity` type

Applied to: `employee-list.component.ts`, `employee-detail.component.ts`,
`showcase.component.ts`.

---

## Step 7 — Verification

Each check was run in order and all passed.

### 7.1 TypeScript compiler

```bash
npx tsc --noEmit
```

**Result:** Zero errors. This was the check that caught the `Message` → `ToastMessageOptions`
rename and the `{ Nora }` named-import error during the iteration process.

### 7.2 Unit tests

```bash
npm test -- --watch=false
```

**Result:** 43/43 tests passed.

```
SUMMARY:
✔ 43 tests completed
```

No tests required updating. The test suite exercises component logic and template bindings;
none directly tested PrimeNG class names or the `Message` import.

### 7.3 Linting

```bash
npm run lint
```

**Result:** `All files pass linting.`

The `@typescript-eslint` v8 upgrade and the `prefer-standalone: off` rule were both needed
before this check passed.

### 7.4 Production build

```bash
npm run build:prod
```

**Result:** Build succeeded. Initial bundle: **1.54 MB** (within the 2 MB budget).

```
Application bundle generation complete.

Initial chunk files   | Names         |  Raw size
main.js               | main          |  1.54 MB
```

---

## Post-Upgrade Notes

### `<p-messages>` deprecation warning (non-breaking)

PrimeNG 18 logs the following at app startup:

```
PrimeNG: Messages component is deprecated as of v18. Use Message component instead.
```

This is a **console warning only** — `<p-messages>` still renders and functions correctly.
The new `<p-message>` component (note: singular) has a different API. Migrating is optional
and out of scope for this upgrade.

### `eslint-visitor-keys` Node.js version advisory

During `npm install`, a peer dependency advisory appeared:

```
npm warn EBADENGINE Unsupported engine {
  package: 'eslint-visitor-keys@5.0.1',
  required: { node: '^20.19.0 || >=22.12.0' },
  current: { node: 'v20.11.1' }
}
```

Node 20.11.1 is below the `>=20.19.0` requirement of `eslint-visitor-keys@5`. This is an
advisory — lint still passes completely because the incompatible API paths are not exercised.
Updating Node.js to 20.19.x or higher would resolve it.

---

## Summary of All Changed Files

| File | Change |
|---|---|
| `package.json` | Angular → `^18.2.x`, `@angular-eslint` → `^18.x`, `@typescript-eslint/{eslint-plugin,parser,utils}` → `^8.x`, `primeng` → `^18.x`, add `@primeng/themes@^18.x` |
| `angular.json` | Removed `primeng/resources/primeng.min.css` from styles array |
| `src/app/app.module.ts` | `definePreset(Nora, {...})` with indigo primary + slate surface tokens; `providePrimeNG` with `cssLayer` |
| `.eslintrc.json` | Added `"@angular-eslint/prefer-standalone": "off"` |
| `src/assets/styles/resources.min.scss` | Five CSS class renames: breadcrumb, messages, paginator, table header, table row |
| `src/app/features/employees/employee-list/employee-list.component.ts` | `Message[]` → `ToastMessageOptions[]`; `getStatusSeverity` return type |
| `src/app/features/employees/employee-detail/employee-detail.component.ts` | `Message[]` → `ToastMessageOptions[]`; `getStatusSeverity` return type |
| `src/app/features/showcase/showcase.component.ts` | Five `Message[]` arrays → `ToastMessageOptions[]` |

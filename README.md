# AI App

![Angular](https://img.shields.io/badge/Angular-17-dd0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![JSON Server](https://img.shields.io/badge/Mock_API-json--server-black)

Employee management demo application built with Angular 17, PrimeNG, and a local mock API (`json-server`).

## Tech Stack

- Angular 17
- TypeScript
- PrimeNG + PrimeFlex + PrimeIcons
- JSON Server for local API mocking
- ESLint + Angular ESLint

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## Quick Start

```bash
npm install
```

Run app and API together:

```bash
npm run start:all
```

Then open:

- App: `http://localhost:4200`
- API: `http://localhost:3000`

## Available Scripts

- `npm start` - Start Angular app (`ng serve --port 4200 --open`)
- `npm run start:api` - Start JSON Server mock API on port `3000`
- `npm run start:all` - Run app and API concurrently
- `npm run build` - Build the app
- `npm run build:prod` - Production build
- `npm run watch` - Development build in watch mode
- `npm test` - Run unit tests
- `npm run lint` - Run lint checks
- `npm run lint:fix` - Auto-fix lint issues

## Project Structure

```text
src/app/
	core/       # shared models/services
	features/   # feature modules (employees)
	shared/     # layout + reusable UI
```

## Build Output

Production build artifacts are generated in `dist/`.

## Notes

- Mock data is stored in `db.json`.
- `.gitignore` is configured to exclude local/build artifacts for clean repository pushes.

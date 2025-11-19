# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is an Angular 20 application using:

- **Standalone Components**: All components use standalone: true (no NgModules)
- **Zoneless Change Detection**: Using `provideZonelessChangeDetection()` instead of Zone.js
- **Signals**: Using Angular signals for reactive state management
- **SCSS**: Component styles use SCSS
- **Angular Material**: Using the deeppurple-amber theme

### API Integration

The app integrates with the Artifacts MMO API (api.artifactsmmo.com) using an auto-generated SDK:

- SDK location: `src/sdk/api/`
- SDK is generated from `src/sdk/document.json` using `@hey-api/openapi-ts`
- SDK uses Angular-specific client plugin (`@hey-api/client-angular`)
- API client is configured in AppComponent with base URL and auth header
- Auth token is stored in `src/environments/environment.local.ts`

### Configuration

The app uses a "local" configuration for development:

- Default dev server: `npm start` (runs `ng serve --configuration=local`)
- Environment files: `src/environments/environment.local.ts` contains API token
- Angular config: `angular.json` defines three configs: production, development, and local

## Common Commands

### Development

```bash
npm start                    # Start dev server on localhost:4200 (uses local config)
ng serve                     # Start dev server (uses development config)
ng serve --configuration=local  # Explicit local configuration
```

### Building

```bash
npm run build               # Production build
ng build --watch --configuration development  # Watch mode for development
```

### Testing

```bash
npm test                    # Run unit tests via Karma
ng test                     # Same as above
```

### Linting/Formatting

```bash
npm run lint                # Format code with Prettier
bunx prettier . --write     # Same as above
```

### SDK Generation

To regenerate the API client after updating `src/sdk/document.json`:

```bash
cd src/sdk
npx @hey-api/openapi-ts
```

## TypeScript Configuration

This project uses strict TypeScript settings:

- Strict mode enabled
- No implicit overrides, returns, or index signature access
- No fallthrough cases in switches
- Strict template checking enabled in Angular compiler

What you must do:

- NEVER write comment to explain the code

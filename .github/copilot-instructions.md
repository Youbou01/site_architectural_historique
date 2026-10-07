## Quick overview

- This project is an Angular 20 single-page app (see `package.json` dependencies: `@angular/*@^20.x`). Only use Angular 20+ features (standalone components, `signal`, `inject()`, `@if/@for` templates).
- Files live under `src/app/`. Two main areas: `application/` (game demo) and `exercice/` (employee exercises). Models live in `*/models`, services in `*/services`, components in `*/components`.

## Architecture & important patterns

- Standalone components: components are declared as standalone and list required modules in the `imports` property of `@Component`. Example: `src/app/application/components/game-add/game-add.ts` imports `ReactiveFormsModule` inside the component decorator.
- DI via `inject()`: services and components use `inject()` instead of constructor injection (see `GameService` using `inject(HttpClient)`). Follow that pattern for new services/components.
- Signals + modern APIs: the root uses `signal()` and many components use reactive forms + `FormBuilder`. Prefer Angular 20 idioms.
- Local JSON file(s) used as seed data: `src/app/database/gameDb.json` and `bdEmployes.json` — the app's `GameService` calls `http://localhost:3000/games`. The repo assumes a small local API (json-server or equivalent) when testing HTTP flows.

## Developer workflows (how to run & test)

- Start the dev server (Angular CLI):

```powershell
npm start      # runs `ng serve` (see package.json)
```

- Run tests (Karma + Jasmine):

```powershell
npm test       # runs `ng test`
```

- Build for production:

```powershell
npm run build  # runs `ng build`
```

- Run a local JSON backend (inferred): the code expects `http://localhost:3000/games`. Start a json-server pointing to the provided DB file:

```powershell
npx json-server --watch .\src\app\database\gameDb.json --port 3000
```

If you use a different backend, update `src/app/application/services/game-service.ts` accordingly.

## Project-specific conventions

- Component files: use a folder per component with `*.ts`, `*.html` and `*.css` files (e.g. `game-add/game-add.ts, .html, .css`). Templates are referenced via `templateUrl` and styles via `styleUrl` (follow the existing project naming).
- Registering dependencies: put commonly reused logic in `*/services/*` and the DTOs in `*/models/*`. Example paths:

  - `src/app/application/services/game-service.ts`
  - `src/app/application/models/game.ts`

- Routing is minimal: `src/app/app.routes.ts` is currently an empty `Routes` array. If you add routes, keep them centralized here.

## Integration & cross-component notes

- HTTP endpoints: `GameService` calls `http://localhost:3000/games`. Expect consumer components (like `GameAdd`) to subscribe and update local arrays. When changing the API shape, update models in `*/models` first.
- Reactive forms pattern: components use `FormBuilder` and `FormArray` for dynamic lists (see `game-add.ts` for `shops` example). Reuse the same pattern for forms.

## Quick examples (copy/paste friendly)

- Standalone component skeleton (follow imports pattern):

File: `src/app/example/example.component.ts`

```ts
@Component({
  selector: 'app-example',
  imports: [ReactiveFormsModule],
  templateUrl: './example.html',
  styleUrl: './example.css',
})
export class ExampleComponent {}
```

- Using `inject()` in a service:

```ts
@Injectable({ providedIn: 'root' })
export class FooService {
  private http = inject(HttpClient);
}
```

## Files to check first when editing behavior

- `package.json` — scripts and Angular version
- `src/app/app.ts` — root component (shows use of `signal()` and `imports` pattern)
- `src/app/application/components/game-add/*` — canonical component example (Reactive forms, Http usage)
- `src/app/application/services/game-service.ts` — canonical HTTP service
- `src/app/database/*` — sample JSON payloads used for local dev

## What not to change without verification

- Avoid changing the global Angular major version (project uses Angular 20 APIs).
- Keep the standalone component pattern and `imports` in `@Component` — migrating to NgModules is out of scope.
- Do not change the local API endpoint (`http://localhost:3000/games`) unless you update `GameService` and all components that consume it.

---

# 🚀 Project Coding Instructions — Angular 20+ Only

## 🧠 Overview

This project **strictly uses Angular 20+** and **modern Angular patterns only**.  
Any AI assistant (GitHub Copilot, ChatGPT Copilot, or others) must **avoid legacy Angular syntax, imports, or APIs**.

---

## ✅ Allowed (Modern Angular 20+ Patterns)

- **Standalone Components Only**

  - ✅ Use `@Component({ standalone: true })`
  - ✅ Import dependencies directly via the `imports` array
  - ❌ No `NgModule` declarations

- **Signals API**

  - ✅ Use `signal()`, `computed()`, `effect()` from `@angular/core`
  - ✅ Prefer signals over RxJS `BehaviorSubject`, `EventEmitter`, or manual change detection

- **New Control Flow Syntax**

  - ✅ Use `@if`, `@for`, `@switch`, and `@case` blocks instead of `*ngIf`, `*ngFor`, `*ngSwitch`

- **Dependency Injection**

  - ✅ Use `inject(SomeService)` instead of `constructor(private service: SomeService)`
  - ✅ Functional providers via `provideHttpClient()`, `provideRouter()`, etc.
  - ✅ Prefer `withFetch()` or `withInterceptors()` options for the new `HttpClient`

- **Routing**

  - ✅ Use functional route guards and resolvers:
    ```ts
    export const canActivateUser = () => {
      const auth = inject(AuthService);
      return auth.isLoggedIn();
    };
    ```

- **SSR / Hydration**

  - ✅ Use new `@angular/ssr` setup and modern hydration API

- **Change Detection**

  - ✅ Prefer the new **zoneless** configuration (`provideZoneChangeDetection({ eventCoalescing: true })`)
  - ✅ Avoid using `ChangeDetectorRef.detectChanges()`

- **Other Modern Practices**
  - ✅ Use modern imports and TypeScript strict mode
  - ✅ Use ESBuild or Vite-based builders if configured
  - ✅ Follow latest Angular CLI conventions

---

## 🚫 Disallowed (Legacy Angular Syntax)

- ❌ `NgModule`
- ❌ `BrowserModule`, `AppModule`, `HttpClientModule`, `FormsModule` (use `provide...()` functions instead)
- ❌ `*ngIf`, `*ngFor`, `*ngSwitch`
- ❌ `constructor()` dependency injection
- ❌ `ChangeDetectorRef` manual calls
- ❌ Old Angular CLI scaffolding (`ng generate module`, `ng generate component` with modules)
- ❌ Deprecated APIs or lifecycle hooks that no longer align with signals-based logic

---

## 🧩 Example Template

**✅ Correct (Angular 20+):**

```ts
import { Component, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  template: ` <h1>@if (user()) { Welcome, {{ user().name }}! } @else { Please log in }</h1> `,
})
export class AppComponent {
  user = signal<{ name: string } | null>(null);

  constructor() {
    effect(() => {
      console.log('User changed:', this.user());
    });
  }
}
```
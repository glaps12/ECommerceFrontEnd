# AGENTS.md

## Must-follow constraints
- **Use npm**: keep `package-lock.json` in sync (don’t introduce `yarn.lock` / `pnpm-lock.yaml`).
- **SSR/prerender is enabled** (`@angular/ssr`, `server.ts`, `main.server.ts`): changes must not assume browser-only globals during render (avoid unguarded `window`/`document`/`localStorage` access).

## Validation before finishing
Run from this directory:
- `npm run build`
- `npm test` (if you changed app logic/services/components beyond markup/styling)

## Repo-specific conventions
- **Components are not standalone**: schematics default `standalone: false` (keep module-based wiring consistent).
- **Static assets live in `public/`** (see `angular.json` assets), not `src/assets/`.
- **UI stack**: Angular Material + M3 theme in `src/custom-theme.scss`; global entry styles are `angular.json` → `styles`: `src/custom-theme.scss`, `src/styles.css`.
- **Unit tests**: `karma.conf.js` at project root (referenced from `angular.json` → `test.options.karmaConfig`). On Windows, if Google Chrome is not installed, Karma may use **Edge** as `CHROME_BIN` automatically; override with env `CHROME_BIN` if needed.

## Important locations (only non-obvious)
- **SSR entry**: `server.ts` (Express, default port `4000`).
- **Backend API base URLs** (currently hardcoded): `src/app/services/product.service.ts` uses `http://localhost:8080/api/...`.
- **Theme toggle / dark mode**: `src/app/services/theme.service.ts` (uses `localStorage` only in the browser; `afterNextRender` in `AppComponent` applies saved theme after hydration).

## Change safety rules
- **Don’t break SSR builds**: if you must use browser-only APIs, guard them (e.g., platform checks) so `npm run build` still succeeds.
- **If you add/replace global CSS/libs**, update `angular.json` `styles` (Material theme SCSS + `styles.css`).
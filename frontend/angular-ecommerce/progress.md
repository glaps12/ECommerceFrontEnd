# progress.md

## Done
- [x] Product list page wired to backend (category + pagination)
- [x] Search route (`/search/:keyword`) wired to backend
- [x] Product details route (`/products/:id`) loads product and supports “Add to cart”
- [x] Cart domain model (`CartItem`) implemented
- [x] Cart state/service with totals (`CartService` + `BehaviorSubject`)
- [x] Cart status widget in header with link to `/cart`
- [x] Cart details page: increment/decrement/remove + totals UI
- [x] Router config includes `/cart`
- [x] Migrated UI from Bootstrap/ng-bootstrap to **Angular Material** (M3) with shared `SharedMaterialModule`
- [x] **Dark mode**: `ThemeService` + toolbar toggle, `html.theme-dark` + `all-component-colors`, preference in `localStorage` (browser-only), init after hydration via `afterNextRender`
- [x] App shell: `MatSidenav` / `MatToolbar`, mobile menu for categories, Material icons + Roboto via `index.html`
- [x] Product list: `MatCard` grid, **custom pagination bar** (replaced `MatPaginator` to fix CDK overlay positioning in sidenav), **paginated search** (`searchProductsPaginate`) aligned with category pagination
- [x] Cart page: `MatTable` + summary card
- [x] `ProductService.getProductCategories()` cached with `shareReplay(1)` for a single HTTP round-trip
- [x] SSR: `NoopAnimationsModule` in `app.module.server.ts` alongside `BrowserAnimationsModule` on the client
- [x] Cart details: **table stays in sync** with `CartService` by refreshing `cartItems` from `totalQuantity` emissions (new array reference for `mat-table`); totals already tracked via `BehaviorSubject`
- [x] **Clear cart** button on cart page (`cartService.clear()`)
- [x] **Karma**: root `karma.conf.js` + `angular.json` `karmaConfig`; on Windows, auto-sets `CHROME_BIN` to Chrome if present, otherwise **Microsoft Edge** (Chromium), so `ChromeHeadless` runs without a separate Chrome install
- [x] **UI redesign (2026-04-04)**: Fixed broken product card display (`mat-card-image` negative margins in M3), redesigned entire UI — Inter font, card hover animations, gradient image backgrounds, stock badges, branded sidenav, capsule search bar, custom paginator, refined cart page, themed scrollbar, responsive layouts
- [x] **Search bar**: Replaced bulky `mat-form-field` + button with sleek capsule-shaped inline search bar with embedded icon and clear button
- [x] **Toolbar cleanup**: Removed duplicate "BrookyShop" title; search bar sits left-aligned in toolbar

## Do now
- (none)

## Next
- [ ] **Cart persistence**: Persist cart to `localStorage` (save after every `computeCartTotals`, restore on app init). Guard with `isPlatformBrowser` for SSR safety.
- [ ] **Environment config**: Extract hardcoded backend URLs (`http://localhost:8080/api/...`) from `ProductService` into `environment.ts` / `environment.prod.ts` so the API base is configurable per build.
- [ ] **Checkout page**: Add `/checkout` route with a basic form (name, email, address) and order summary pulled from `CartService`. Link "Proceed to checkout" button from cart details.
- [ ] **Snackbar notifications**: Show `MatSnackBar` toast when adding to cart ("Added X to cart") or clearing cart for better user feedback.
- [ ] **Loading states**: Add skeleton loaders or `MatProgressSpinner` while products/categories are loading from the API to avoid blank flashes.
- [ ] **Subscription cleanup**: Use `takeUntilDestroyed()` or `async` pipe to properly unsubscribe from route/service observables in components (prevent memory leaks).

## Later
- [ ] **Wishlist**: Add a wishlist feature (heart icon on product cards, separate `/wishlist` page, persisted in `localStorage`).
- [ ] **Product sorting**: Add sort-by dropdown (price low→high, high→low, name A→Z) — requires backend `Sort` param support.
- [ ] **Product filtering**: Add price range filter, in-stock filter on the product list page.
- [ ] **User authentication**: Add login/register pages + auth guard (will need backend Spring Security support first).
- [ ] **Shipping/tax calculations**: Separate from subtotal in cart totals, display breakdown in checkout.
- [ ] **Order history**: After checkout domain is built, show past orders for logged-in users.
- [ ] **Image optimization**: Lazy load product images with blur-up placeholders, use `NgOptimizedImage`.
- [ ] **E2E tests**: Configure Playwright or Cypress for end-to-end test coverage.
- [ ] **PWA support**: Add `@angular/pwa` for offline capability and install prompts.
- [ ] **Accessibility audit**: Ensure full WCAG 2.1 AA compliance across all components.
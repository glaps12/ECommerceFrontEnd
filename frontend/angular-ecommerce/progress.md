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

## Do now
- [ ] Ensure cart totals initialize correctly on first load (cart status + cart details show non-zero after adding items)
- [ ] Add “Clear cart” action (UI button + call `cartService.clear()`)
- [ ] Make search use paginated endpoint (match category list behavior) so page size/pagination works in search mode too

## Next
- [ ] Persist cart to `localStorage` (load on startup, save after every totals recompute)
- [ ] Move backend base URLs out of `ProductService` hardcode (`http://localhost:8080/...`) into a single config location
- [ ] Add basic checkout route/page (even placeholder) and link from cart details

## Later
- [ ] Shipping/tax/total calculations (separate from subtotal) + display in cart totals
- [ ] E2E tests (no e2e runner currently configured) or expand unit tests around `CartService`
- [ ] SSR safety review for any browser-only APIs if persistence is added (guard `localStorage` usage)

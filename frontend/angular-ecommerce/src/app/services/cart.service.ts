import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems: CartItem[] = [];
  totalQuantity = new BehaviorSubject<number>(0);
  totalPrice = new BehaviorSubject<number>(0);

  private readonly apiUrl = 'http://localhost:8080/api/cart';
  private syncEmail: string | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  /** Call after login to load the user's persisted cart and merge with local items */
  loadCartFromServer(email: string): void {
    this.syncEmail = email;
    this.http.get<any>(`${this.apiUrl}?email=${email}`).subscribe({
      next: (res) => {
        if (res.items && res.items.length > 0) {
          // Merge server items into local cart
          for (const serverItem of res.items) {
            const existing = this.cartItems.find(ci => ci.id === serverItem.productId);
            if (existing) {
              // Keep the higher quantity
              existing.quantity = Math.max(existing.quantity, serverItem.quantity);
            } else {
              // Create a product-like object from server data
              const product = new Product(
                serverItem.productId,
                '',
                serverItem.name,
                '',
                serverItem.unitPrice,
                serverItem.imageUrl,
                true,
                999,
                new Date(),
                new Date()
              );
              const cartItem = new CartItem(product);
              cartItem.quantity = serverItem.quantity;
              this.cartItems.push(cartItem);
            }
          }
          this.computeCartTotals();
        }
        // After merge, sync the merged state back
        this.syncCartToServer();
      },
      error: (err) => console.error('Failed to load cart from server', err)
    });
  }

  /** Sync current local cart state to the server */
  syncCartToServer(): void {
    if (!this.syncEmail) return;

    const items = this.cartItems.map(ci => ({
      productId: ci.id,
      quantity: ci.quantity
    }));

    this.http.post(`${this.apiUrl}/sync?email=${this.syncEmail}`, { items }).subscribe({
      error: (err) => console.error('Failed to sync cart to server', err)
    });
  }

  /** Clear the sync email on logout */
  clearSync(): void {
    this.syncEmail = null;
  }

  /** Set email for syncing (e.g., when user is already logged in on page load) */
  setSyncEmail(email: string): void {
    this.syncEmail = email;
  }

  addToCart(product: Product) {
    const existingCartItem = this.cartItems.find(item => item.id === product.id);

    if (existingCartItem) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(new CartItem(product));
    }

    this.computeCartTotals();
    this.syncCartToServer();
    
    // Show Snackbar notification
    this.snackBar.open(this.translate.instant('CART.ADDED_TO_CART'), 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;

    if (cartItem.quantity === 0) {
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
      this.syncCartToServer();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(item => item.id === cartItem.id);
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
      this.syncCartToServer();
    }
  }

  clear() {
    this.cartItems.length = 0;
    this.totalQuantity.next(0);
    this.totalPrice.next(0);

    // Also clear on server
    if (this.syncEmail) {
      this.http.delete(`${this.apiUrl}/clear?email=${this.syncEmail}`).subscribe({
        error: (err) => console.error('Failed to clear cart on server', err)
      });
    }
  }

  private computeCartTotals() {
    const totalPrice = this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    this.totalPrice.next(totalPrice);
    this.totalQuantity.next(totalQuantity);
  }
}

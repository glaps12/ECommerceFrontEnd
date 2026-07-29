import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems: CartItem[] = [];
  totalQuantity = new BehaviorSubject<number>(0);
  totalPrice = new BehaviorSubject<number>(0);

  private readonly apiUrl = `${inject(API_BASE_URL)}/cart`;
  private syncEnabled = false;

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  /** Call after login to load the user's persisted cart and merge with local items */
  loadCartFromServer(): void {
    this.syncEnabled = true;
    this.http.get<CartResponse>(this.apiUrl).subscribe({
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
                serverItem.unitsInStock,
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
    if (!this.syncEnabled) return;

    const items = this.cartItems.map(ci => ({
      productId: ci.id,
      quantity: ci.quantity
    }));

    this.http.post(`${this.apiUrl}/sync`, { items }).subscribe({
      error: (err) => console.error('Failed to sync cart to server', err)
    });
  }

  /** Clear the sync email on logout */
  clearSync(): void {
    this.syncEnabled = false;
  }

  addToCart(product: Product) {
    const existingCartItem = this.cartItems.find(item => item.id === product.id);
    const currentQuantity = existingCartItem?.quantity ?? 0;

    if (!product.active || product.unitsInStock <= currentQuantity) {
      this.snackBar.open(this.translate.instant('CART.STOCK_LIMIT'), 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

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
    if (this.syncEnabled) {
      this.http.delete(`${this.apiUrl}/clear`).subscribe({
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

interface CartResponse {
  items: Array<{
    productId: number;
    quantity: number;
    name: string;
    unitPrice: number;
    imageUrl: string;
    unitsInStock: number;
  }>;
}

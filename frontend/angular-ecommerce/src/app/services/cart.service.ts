import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartItems: CartItem[] = [];
  totalQuantity = new BehaviorSubject<number>(0);
  totalPrice = new BehaviorSubject<number>(0);

  addToCart(product: Product) {
    const existingCartItem = this.cartItems.find(item => item.id === product.id);

    if (existingCartItem) {
      existingCartItem.quantity++;
    } else {
      this.cartItems.push(new CartItem(product));
    }

    this.computeCartTotals();
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;

    if (cartItem.quantity === 0) {
      this.remove(cartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(cartItem: CartItem) {
    const itemIndex = this.cartItems.findIndex(item => item.id === cartItem.id);
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }

  clear() {
    this.cartItems.length = 0;
    this.totalQuantity.next(0);
    this.totalPrice.next(0);
  }

  private computeCartTotals() {
    const totalPrice = this.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalQuantity = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);

    this.totalPrice.next(totalPrice);
    this.totalQuantity.next(totalQuantity);
  }
}



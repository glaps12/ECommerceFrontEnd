import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.css',
})
export class CartDetailsComponent implements OnInit {
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'subtotal', 'actions'];
  cartItems: CartItem[] = [];
  totalPrice = 0;
  totalQuantity = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.totalQuantity.subscribe((quantity) => {
      this.totalQuantity = quantity;
      this.cartItems = [...this.cartService.cartItems];
    });
    this.cartService.totalPrice.subscribe((price) => (this.totalPrice = price));
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.addToCart(item.product);
  }

  decrementQuantity(item: CartItem): void {
    this.cartService.decrementQuantity(item);
  }

  removeItem(item: CartItem): void {
    this.cartService.remove(item);
  }

  clearCart(): void {
    this.cartService.clear();
  }
}
import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-cart-status',
    templateUrl: './cart-status.component.html',
    styleUrl: './cart-status.component.css',
    standalone: false
})
export class CartStatusComponent implements OnInit {
  totalQuantity: number = 0;
  totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartService.totalQuantity.subscribe(qty => this.totalQuantity = qty);
    this.cartService.totalPrice.subscribe(price => this.totalPrice = price);
  }
}

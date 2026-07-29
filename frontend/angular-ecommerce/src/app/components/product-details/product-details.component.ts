import { Component } from '@angular/core';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-product-details',
    templateUrl: './product-details.component.html',
    styleUrl: './product-details.component.css',
    standalone: false
})
export class ProductDetailsComponent {

  product!: Product;
  
  constructor(private productService: ProductService , private route: ActivatedRoute, private cartService: CartService, public wishlistService: WishlistService, private authService: AuthService) {

    
  };
    ngOnInit() {
      this.route.paramMap.subscribe(() => {
        this.handleProductDetails();
      });
    }
  handleProductDetails() {
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;
    
    
    this.productService.getProduct(theProductId).subscribe(
      data => {
        this.product = data;
      }
    );

  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  toggleWishlist(product: Product): void {
    if (this.authService.hasValidSession()) {
      this.wishlistService.toggleWishlist(product.id);
    }
  }

  isWishlisted(productId: number): boolean {
    return this.wishlistService.isWishlisted(productId);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn$.value;
  }


}

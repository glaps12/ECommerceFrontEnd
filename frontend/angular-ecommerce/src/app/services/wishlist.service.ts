import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

export interface WishlistItemData {
  productId: number;
  name: string;
  unitPrice: number;
  imageUrl: string;
  unitsInStock: number;
  dateAdded: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly apiUrl = `${inject(API_BASE_URL)}/wishlist`;

  readonly wishlistItems$ = new BehaviorSubject<WishlistItemData[]>([]);
  readonly wishlistCount$ = new BehaviorSubject<number>(0);

  /** Set of product IDs currently in the wishlist, for fast lookup */
  private wishlistedIds = new Set<number>();

  constructor(
    private readonly http: HttpClient,
    private readonly snackBar: MatSnackBar,
    private readonly translate: TranslateService,
  ) {}

  /** Load wishlist from server after login */
  loadWishlist(): void {
    this.http.get<WishlistResponse>(this.apiUrl).subscribe({
      next: (res) => {
        const items: WishlistItemData[] = res.items || [];
        this.wishlistItems$.next(items);
        this.wishlistCount$.next(items.length);
        this.wishlistedIds = new Set(items.map((i: WishlistItemData) => i.productId));
      },
      error: (err) => console.error('Failed to load wishlist', err)
    });
  }

  /** Check if a product is wishlisted (local, synchronous) */
  isWishlisted(productId: number): boolean {
    return this.wishlistedIds.has(productId);
  }

  /** Toggle wishlist for a product */
  toggleWishlist(productId: number): void {
    if (this.isWishlisted(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  }

  /** Add a product to wishlist */
  addToWishlist(productId: number): void {
    const params = new HttpParams().set('productId', productId);
    this.http.post<MutationResponse>(this.apiUrl, {}, { params }).subscribe({
      next: () => {
        this.wishlistedIds.add(productId);
        this.loadWishlist(); // Refresh full list
        this.snackBar.open(this.translate.instant('WISHLIST.ADDED'), 'OK', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => console.error('Failed to add to wishlist', err)
    });
  }

  /** Remove a product from wishlist */
  removeFromWishlist(productId: number): void {
    const params = new HttpParams().set('productId', productId);
    this.http.delete<MutationResponse>(this.apiUrl, { params }).subscribe({
      next: () => {
        this.wishlistedIds.delete(productId);
        this.loadWishlist(); // Refresh full list
        this.snackBar.open(this.translate.instant('WISHLIST.REMOVED'), 'OK', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      },
      error: (err) => console.error('Failed to remove from wishlist', err)
    });
  }

  /** Clear local state on logout */
  clearWishlist(): void {
    this.wishlistItems$.next([]);
    this.wishlistCount$.next(0);
    this.wishlistedIds.clear();
  }
}

interface WishlistResponse {
  items: WishlistItemData[];
}

interface MutationResponse {
  success: boolean;
  message: string;
}

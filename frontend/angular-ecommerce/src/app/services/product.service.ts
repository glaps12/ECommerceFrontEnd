import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Product } from '../common/product';
import { map, Observable, shareReplay } from 'rxjs';
import { ProductCategory } from '../common/product-category';
import { HttpParams } from '@angular/common/http';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly baseUrl = `${this.apiBaseUrl}/products`;
  private readonly categoryUrl = `${this.apiBaseUrl}/product-category`;

  private categories$: Observable<ProductCategory[]> | null = null;

  constructor(private httpClient: HttpClient) {}

  getProductList(CategoryId: number): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(
      `${this.baseUrl}/search/findByCategoryId`,
      { params: new HttpParams().set('id', CategoryId) },
    ).pipe(map((response) => response._embedded.products));
  }

  getProductListPaginate(
    thePageNumber: number,
    thePageSize: number,
    CategoryId: number,
  ): Observable<GetResponseProducts> {
    const params = new HttpParams()
      .set('id', CategoryId)
      .set('page', thePageNumber)
      .set('size', thePageSize);
    return this.httpClient.get<GetResponseProducts>(
      `${this.baseUrl}/search/findByCategoryId`,
      { params },
    );
  }

  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    if (!this.categories$) {
      this.categories$ = this.httpClient.get<GetResponseProductCategories>(this.categoryUrl).pipe(
        map((response) => response._embedded.productCategory),
        shareReplay(1),
      );
    }
    return this.categories$;
  }

  searchProducts(keyword: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(
      `${this.baseUrl}/search/findByNameContaining`,
      { params: new HttpParams().set('name', keyword) },
    ).pipe(map((response) => response._embedded.products));
  }

  searchProductsPaginate(
    keyword: string,
    thePageNumber: number,
    thePageSize: number,
  ): Observable<GetResponseProducts> {
    const params = new HttpParams()
      .set('name', keyword)
      .set('page', thePageNumber)
      .set('size', thePageSize);
    return this.httpClient.get<GetResponseProducts>(
      `${this.baseUrl}/search/findByNameContaining`,
      { params },
    );
  }

}

interface GetResponseProducts {
  _embedded: {
    products: Product[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  };
}

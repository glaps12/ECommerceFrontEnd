import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../common/product';
import { map, Observable } from 'rxjs';
import { ProductCategory } from '../common/product-category';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
  
  

 
  private baseUrl = "http://localhost:8080/api/products";
  private categoryUrl = "http://localhost:8080/api/product-category";

  constructor(private httpClient : HttpClient) { }

 getProductList(CategoryId : number): Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${CategoryId}`;
   return this.getProducts(searchUrl);
  }
  getProductListPaginate(thePageNumber: number, thePageSize: number, CategoryId : number): Observable<GetResponseProducts> {

    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${CategoryId}&page=${thePageNumber}&size=${thePageSize}`;
   return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }
  
  getProductCategories() : Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategories>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory)
    );
  }

  searchProducts(keyword: string) : Observable<Product[]> {

    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${keyword}`;
    return this.getProducts(searchUrl);
    

    
  }



  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }
}

interface GetResponseProducts {
  _embedded: {
    products: Product[];

  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  }
}

interface GetResponseProductCategories {
  _embedded: {
    productCategory: ProductCategory[];
  }
    
}

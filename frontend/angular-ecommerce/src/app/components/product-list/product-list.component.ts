import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../common/product';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId = 1;
  searchMode = false;
  previousCategoryId = 1;
  previousKeyword = '';

  thePageNumber = 1;
  thePageSize = 10;
  theTotalElements = 0;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  get lastPage(): number {
    return Math.ceil(this.theTotalElements / this.thePageSize);
  }

  listProducts(): void {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }
  }

  onPageSizeChange(size: number): void {
    this.thePageSize = size;
    this.thePageNumber = 1;
    this.listProducts();
  }

  goToPage(page: number): void {
    this.thePageNumber = page;
    this.listProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  handleSearchProducts(): void {
    const keyword = this.route.snapshot.paramMap.get('keyword')!;
    if (this.previousKeyword !== keyword) {
      this.thePageNumber = 1;
      this.previousKeyword = keyword;
    }
    this.productService
      .searchProductsPaginate(keyword, this.thePageNumber - 1, this.thePageSize)
      .subscribe((data) => {
        this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
      });
  }

  handleListProducts(): void {
    const hasCategoryId = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
    } else {
      this.currentCategoryId = 1;
    }

    if (this.previousCategoryId !== this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;

    this.productService
      .getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId)
      .subscribe((data) => {
        this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
      });
  }
}
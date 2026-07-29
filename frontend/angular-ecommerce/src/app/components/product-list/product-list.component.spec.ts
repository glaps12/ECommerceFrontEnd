import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { SharedMaterialModule } from '../../shared-material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ProductListComponent', () => {
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(async () => {
    const emptyPage = {
      _embedded: { products: [] },
      page: { size: 10, totalElements: 0, totalPages: 0, number: 0 },
    };
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedMaterialModule, HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [ProductListComponent],
      providers: [
        provideNoopAnimations(),
        CartService,
        {
          provide: ProductService,
          useValue: {
            getProductListPaginate: () => of(emptyPage),
            searchProductsPaginate: () => of(emptyPage),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: { paramMap: convertToParamMap({ id: '1' }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductListComponent);
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

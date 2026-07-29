import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductDetailsComponent } from './product-details.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { SharedMaterialModule } from '../../shared-material.module';
import { Product } from '../../common/product';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ProductDetailsComponent', () => {
  let fixture: ComponentFixture<ProductDetailsComponent>;

  beforeEach(async () => {
    const product: Product = new Product(
      1,
      'sku',
      'Test',
      'Desc',
      9.99,
      'https://example.com/x.png',
      true,
      5,
      new Date(),
      new Date(),
    );
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedMaterialModule, HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [ProductDetailsComponent],
      providers: [
        provideNoopAnimations(),
        CartService,
        {
          provide: ProductService,
          useValue: { getProduct: () => of(product) },
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

    fixture = TestBed.createComponent(ProductDetailsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

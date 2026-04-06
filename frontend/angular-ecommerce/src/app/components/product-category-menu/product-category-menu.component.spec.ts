import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductCategoryMenuComponent } from './product-category-menu.component';
import { ProductService } from '../../services/product.service';
import { SharedMaterialModule } from '../../shared-material.module';

describe('ProductCategoryMenuComponent', () => {
  let fixture: ComponentFixture<ProductCategoryMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedMaterialModule],
      declarations: [ProductCategoryMenuComponent],
      providers: [
        provideNoopAnimations(),
        {
          provide: ProductService,
          useValue: { getProductCategories: () => of([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCategoryMenuComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
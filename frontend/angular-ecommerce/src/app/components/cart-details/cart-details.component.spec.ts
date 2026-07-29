import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CartDetailsComponent } from './cart-details.component';
import { CartService } from '../../services/cart.service';
import { SharedMaterialModule } from '../../shared-material.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('CartDetailsComponent', () => {
  let fixture: ComponentFixture<CartDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedMaterialModule, HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [CartDetailsComponent],
      providers: [provideNoopAnimations(), CartService],
    }).compileComponents();

    fixture = TestBed.createComponent(CartDetailsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

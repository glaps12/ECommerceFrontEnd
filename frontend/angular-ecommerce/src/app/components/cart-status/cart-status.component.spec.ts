import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CartStatusComponent } from './cart-status.component';
import { CartService } from '../../services/cart.service';
import { SharedMaterialModule } from '../../shared-material.module';

describe('CartStatusComponent', () => {
  let fixture: ComponentFixture<CartStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedMaterialModule],
      declarations: [CartStatusComponent],
      providers: [provideNoopAnimations(), CartService],
    }).compileComponents();

    fixture = TestBed.createComponent(CartStatusComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
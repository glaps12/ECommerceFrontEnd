import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartDetailsComponent } from './cart-details.component';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

describe('CartDetailsComponent', () => {
  let component: CartDetailsComponent;
  let fixture: ComponentFixture<CartDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CartDetailsComponent],
      providers: [CartService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


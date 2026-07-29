import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { CheckoutService } from '../../services/checkout.service';
import { Address } from '../../common/address';
import { TURKISH_CITIES } from '../../common/turkish-cities';
import { CartItem } from '../../common/cart-item';

type CheckoutAddress = Omit<Address, 'id' | 'fullAddress'>;

interface CheckoutRequestPayload {
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  addressId?: number | null;
  inlineAddress?: CheckoutAddress;
  saveAddress?: boolean;
}

@Component({
    selector: 'app-checkout',
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css'],
    standalone: false
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  readonly cartService = inject(CartService);
  readonly authService = inject(AuthService);
  private readonly addressService = inject(AddressService);
  private readonly checkoutService = inject(CheckoutService);
  readonly translate = inject(TranslateService);

  // State
  isLoggedIn = false;
  userEmail: string | null = null;
  cartItems: CartItem[] = [];
  totalPrice = 0;
  totalQuantity = 0;
  savedAddresses: Address[] = [];
  selectedAddressId: number | null = null;
  useNewAddress = false;
  isProcessing = false;
  orderPlaced = false;
  orderTrackingNumber = '';
  detectedCardBrand = '';

  // Data
  cities = TURKISH_CITIES;


  // Forms
  addressForm!: FormGroup;
  paymentForm!: FormGroup;

  ngOnInit(): void {
    // Check cart
    this.cartItems = [...this.cartService.cartItems];
    this.cartService.totalPrice.subscribe(p => this.totalPrice = p);
    this.cartService.totalQuantity.subscribe(q => this.totalQuantity = q);

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    // Check auth
    this.isLoggedIn = this.authService.isLoggedIn$.value;
    this.userEmail = this.authService.userEmail$.value;

    // Build forms
    this.addressForm = this.fb.group({
      label: ['', Validators.required],
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      phoneNumber: ['', [Validators.required]],
      city: ['', Validators.required],
      district: [''],
      neighborhood: [''],
      street: [''],
      buildingNo: [''],
      apartmentNo: [''],
      postalCode: [''],
      saveAddress: [true]
    });

    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.minLength(16)]],
      cardHolderName: ['', [Validators.required, Validators.minLength(3)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]]
    });

    // Pre-fill name/phone from profile
    if (this.isLoggedIn && this.userEmail) {
      const fullName = [
        this.authService.userName$.value || '',
        this.authService.userLastName$.value || ''
      ].filter(Boolean).join(' ');
      this.addressForm.patchValue({ fullName });

      const phone = this.authService.userPhone$.value || '';
      this.addressForm.patchValue({ phoneNumber: phone });

      // Load saved addresses
      this.addressService.getAddresses().subscribe({
        next: (addresses) => {
          this.savedAddresses = addresses;
          if (addresses.length > 0) {
            this.selectedAddressId = addresses[0].id ?? null;
            this.useNewAddress = false;
          } else {
            this.useNewAddress = true;
          }
        },
        error: () => this.useNewAddress = true
      });
    } else {
      this.useNewAddress = true;
    }
  }

  // Card number formatting & brand detection
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);

    // Format with spaces
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formatted;
    this.paymentForm.get('cardNumber')?.setValue(value, { emitEvent: false });

    // Detect brand
    this.detectedCardBrand = this.detectCardBrand(value);
  }

  detectCardBrand(number: string): string {
    if (!number || number.length < 2) return '';
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^(9792|65)/.test(number)) return 'troy';
    if (/^3[47]/.test(number)) return 'amex';
    return '';
  }

  getCardBrandIcon(): string {
    switch (this.detectedCardBrand) {
      case 'visa': return 'credit_card';
      case 'mastercard': return 'credit_card';
      case 'troy': return 'credit_card';
      case 'amex': return 'credit_card';
      default: return 'payment';
    }
  }

  getCardBrandLabel(): string {
    switch (this.detectedCardBrand) {
      case 'visa': return 'VISA';
      case 'mastercard': return 'Mastercard';
      case 'troy': return 'TROY';
      case 'amex': return 'AMEX';
      default: return '';
    }
  }

  // Luhn check on frontend
  luhnCheck(number: string): boolean {
    let sum = 0;
    let alternate = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let n = parseInt(number.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  // Masked card for review
  get maskedCard(): string {
    const num = this.paymentForm.get('cardNumber')?.value || '';
    if (num.length < 4) return '•••• •••• •••• ••••';
    const last4 = num.substring(num.length - 4);
    return `•••• •••• •••• ${last4}`;
  }

  // Get selected address for review
  get selectedAddress(): Address | null {
    if (this.useNewAddress) return null;
    return this.savedAddresses.find(a => a.id === this.selectedAddressId) || null;
  }

  // Place order
  placeOrder(): void {
    if (this.isProcessing) return;

    // Validate payment
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if ((this.useNewAddress && this.addressForm.invalid)
      || (!this.useNewAddress && this.selectedAddressId === null)) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const cardNum = this.paymentForm.get('cardNumber')?.value?.replace(/\s/g, '');
    if (!this.luhnCheck(cardNum)) {
      this.snackBar.open(
        this.translate.instant('CHECKOUT.INVALID_CARD'),
        'OK',
        { duration: 4000, panelClass: ['error-snackbar'], verticalPosition: 'top', horizontalPosition: 'center' }
      );
      return;
    }

    this.isProcessing = true;

    // Build request
    const request: CheckoutRequestPayload = {
      cardNumber: cardNum,
      cardHolderName: this.paymentForm.get('cardHolderName')?.value,
      expiryMonth: this.paymentForm.get('expiryMonth')?.value,
      expiryYear: this.paymentForm.get('expiryYear')?.value,
      cvv: this.paymentForm.get('cvv')?.value
    };

    if (this.useNewAddress) {
      const addr = this.addressForm.value;
      request.inlineAddress = {
        label: addr.label,
        fullName: addr.fullName,
        phoneNumber: addr.phoneNumber,
        city: addr.city,
        district: addr.district,
        neighborhood: addr.neighborhood,
        street: addr.street,
        buildingNo: addr.buildingNo,
        apartmentNo: addr.apartmentNo,
        postalCode: addr.postalCode
      };
      request.saveAddress = Boolean(addr.saveAddress);
    } else {
      request.addressId = this.selectedAddressId;
    }

    this.checkoutService.placeOrder(request).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.success) {
          this.orderPlaced = true;
          this.orderTrackingNumber = res.orderTrackingNumber;
          this.cartService.cartItems.length = 0;
          this.cartService.totalPrice.next(0);
          this.cartService.totalQuantity.next(0);
        } else {
          this.snackBar.open(res.message, 'OK', {
            duration: 5000, panelClass: ['error-snackbar'],
            verticalPosition: 'top', horizontalPosition: 'center'
          });
        }
      },
      error: (err) => {
        this.isProcessing = false;
        const msg = err.error?.message || 'Checkout failed. Please try again.';
        this.snackBar.open(msg, 'OK', {
          duration: 5000, panelClass: ['error-snackbar'],
          verticalPosition: 'top', horizontalPosition: 'center'
        });
      }
    });
  }

  selectAddress(id: number): void {
    this.selectedAddressId = id;
    this.useNewAddress = false;
  }

  toggleNewAddress(): void {
    this.useNewAddress = true;
    this.selectedAddressId = null;
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  // Expiry months/years
  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  get years(): string[] {
    const current = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => String(current + i).slice(-2));
  }
}

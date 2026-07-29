import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AddressService } from '../../services/address.service';
import { Address } from '../../common/address';
import { TURKISH_CITIES } from '../../common/turkish-cities';
import { WishlistService, WishlistItemData } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../common/product';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    standalone: false
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly addressService = inject(AddressService);
  readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);

  activeSection: 'profile' | 'orders' | 'addresses' | 'security' | 'wishlist' = 'profile';

  cities = TURKISH_CITIES;
  savedAddresses: Address[] = [];
  isEditingAddress = false;
  editingAddressId: number | null = null;
  isAddressLoading = false;

  addressForm: FormGroup = this.fb.group({
    label: ['', Validators.required],
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    phoneNumber: ['', [Validators.required]],
    city: ['', Validators.required],
    district: [''],
    neighborhood: [''],
    street: [''],
    buildingNo: [''],
    apartmentNo: [''],
    postalCode: ['']
  });

  settingsForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, this.turkishPhoneValidator()]],
    birthDate: [''],
    currentPassword: [''],
    newPassword: ['', [Validators.minLength(8)]],
    confirmPassword: ['']
  });

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const currentEmail = this.authService.userEmail$.value;
    const currentName = this.authService.userName$.value;

    // Check for query param section (e.g. ?section=wishlist)
    this.route.queryParams.subscribe(params => {
      if (params['section'] && ['profile', 'orders', 'addresses', 'security', 'wishlist'].includes(params['section'])) {
        this.activeSection = params['section'] as any;
      }
    });
    
    if (currentEmail) {
      let phoneWithoutRegion = this.authService.userPhone$.value || '';
      if (phoneWithoutRegion.startsWith('+90')) {
        phoneWithoutRegion = phoneWithoutRegion.substring(3);
      }

      // Optimistic patch from local storage
      this.settingsForm.patchValue({ 
        email: currentEmail,
        firstName: currentName || '',
        lastName: this.authService.userLastName$.value || '',
        phoneNumber: phoneWithoutRegion,
        birthDate: this.authService.userBirthDate$.value || ''
      });

      this.loadAddresses();

      // Synchronize dynamically with backend
      this.authService.getProfile().subscribe({
        next: (res) => {
          if (res.success) {
            let backendPhone = res.phoneNumber || '';
            if (backendPhone.startsWith('+90')) {
              backendPhone = backendPhone.substring(3);
            }
            this.settingsForm.patchValue({
              email: res.email,
              firstName: res.firstName || '',
              lastName: res.lastName || '',
              phoneNumber: backendPhone,
              birthDate: res.birthDate || ''
            });
          }
        },
        error: (err) => console.error('Failed to sync profile', err)
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  setSection(section: 'profile' | 'orders' | 'addresses' | 'security' | 'wishlist'): void {
    this.activeSection = section;
  }

  setSectionFromTab(event: any): void {
    const sections: ('profile' | 'orders' | 'addresses' | 'security' | 'wishlist')[] = ['profile', 'orders', 'addresses', 'security', 'wishlist'];
    this.activeSection = sections[event.index];
  }

  loadAddresses() {
    this.addressService.getAddresses().subscribe({
      next: (addrs) => this.savedAddresses = addrs,
      error: (err) => console.error('Failed to load addresses', err)
    });
  }

  addNewAddress() {
    this.isEditingAddress = true;
    this.editingAddressId = null;
    this.addressForm.reset();
  }

  editAddress(addr: Address) {
    this.isEditingAddress = true;
    this.editingAddressId = addr.id || null;
    this.addressForm.patchValue(addr);
  }

  cancelEditAddress() {
    this.isEditingAddress = false;
    this.editingAddressId = null;
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    const email = this.authService.userEmail$.value;
    if (!email) return;

    this.isAddressLoading = true;
    const addrData = this.addressForm.value as Address;

    if (this.editingAddressId) {
      this.addressService.updateAddress(this.editingAddressId, addrData).subscribe({
        next: () => {
          this.snackBar.open('Address updated!', 'OK', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['success-snackbar'] });
          this.isAddressLoading = false;
          this.isEditingAddress = false;
          this.loadAddresses();
        },
        error: () => this.isAddressLoading = false
      });
    } else {
      this.addressService.createAddress(addrData).subscribe({
        next: () => {
          this.snackBar.open('Address added!', 'OK', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center', panelClass: ['success-snackbar'] });
          this.isAddressLoading = false;
          this.isEditingAddress = false;
          this.loadAddresses();
        },
        error: () => this.isAddressLoading = false
      });
    }
  }

  deleteAddress(id: number) {
    const email = this.authService.userEmail$.value;
    if (!email || !id) return;
    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.snackBar.open('Address deleted', 'OK', { duration: 3000, verticalPosition: 'top', horizontalPosition: 'center' });
        this.loadAddresses();
      }
    });
  }

  turkishPhoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      if (value.startsWith('0')) {
        return { startsWithZero: true };
      }
      return /^5[0-9]{9}$/.test(value) ? null : { pattern: true };
    };
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.snackBar.open('Please correct the errors in the form before saving.', 'OK', { 
        duration: 4000, 
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    const { email, firstName, lastName, phoneNumber, birthDate, currentPassword, newPassword, confirmPassword } = this.settingsForm.value;

    if (newPassword && newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'OK', { 
        duration: 3000, 
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'center'
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const birthDateISO = birthDate ? new Date(birthDate).toISOString().split('T')[0] : undefined;
    const finalCurrentPassword = currentPassword ? currentPassword : undefined;
    const finalNewPassword = newPassword ? newPassword : undefined;
    const formattedPhone = phoneNumber ? `+90${phoneNumber}` : undefined;

    this.authService.updateSettings({ 
      email, firstName, lastName, 
      phoneNumber: formattedPhone, 
      birthDate: birthDateISO, 
      currentPassword: finalCurrentPassword, 
      newPassword: finalNewPassword 
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.snackBar.open('Saved successfully!', 'OK', { 
            duration: 4000, 
            panelClass: ['success-snackbar'],
            verticalPosition: 'top',
            horizontalPosition: 'center'
          });
          this.settingsForm.get('currentPassword')?.reset();
          this.settingsForm.get('newPassword')?.reset();
          this.settingsForm.get('confirmPassword')?.reset();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Profile update error:', err);
        // Try to get message from backend error response
        this.errorMessage = err.error?.message || err.message || 'Failed to update profile.';
        this.snackBar.open(this.errorMessage, 'OK', { 
          duration: 5000, 
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'center'
        });
      }
    });
  }

  removeFromWishlist(productId: number): void {
    if (this.authService.hasValidSession()) {
      this.wishlistService.removeFromWishlist(productId);
    }
  }

  addToCartFromWishlist(item: WishlistItemData): void {
    const product = new Product(
      item.productId, '', item.name, '', item.unitPrice,
      item.imageUrl, true, item.unitsInStock, new Date(), new Date()
    );
    this.cartService.addToCart(product);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  activeSection: 'profile' | 'orders' | 'addresses' | 'security' = 'profile';

  settingsForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phoneNumber: ['', [Validators.required, this.turkishPhoneValidator()]],
    birthDate: [''],
    currentPassword: [''],
    newPassword: ['', [Validators.minLength(6)]],
    confirmPassword: ['']
  });

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const currentEmail = this.authService.userEmail$.value;
    const currentName = this.authService.userName$.value;
    
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

      // Synchronize dynamically with backend
      this.authService.getProfile(currentEmail).subscribe({
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

  setSection(section: 'profile' | 'orders' | 'addresses' | 'security'): void {
    this.activeSection = section;
  }

  setSectionFromTab(event: any): void {
    const sections: ('profile' | 'orders' | 'addresses' | 'security')[] = ['profile', 'orders', 'addresses', 'security'];
    this.activeSection = sections[event.index];
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
        horizontalPosition: 'right'
      });
      return;
    }

    const { email, firstName, lastName, phoneNumber, birthDate, currentPassword, newPassword, confirmPassword } = this.settingsForm.value;

    if (newPassword && newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'OK', { 
        duration: 3000, 
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
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
            horizontalPosition: 'right'
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
          horizontalPosition: 'right'
        });
      }
    });
  }
}

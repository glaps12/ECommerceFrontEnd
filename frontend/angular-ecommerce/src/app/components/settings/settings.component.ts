import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      this.settingsForm.patchValue({ 
        email: currentEmail,
        firstName: currentName // firstName is currently stored in userName$
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

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const { email, firstName, lastName, currentPassword, newPassword, confirmPassword } = this.settingsForm.value;

    if (newPassword && newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match.', 'OK', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.updateSettings({ email, firstName, lastName, currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.snackBar.open('Profile updated successfully!', '🎉', { duration: 3000 });
          this.settingsForm.get('currentPassword')?.reset();
          this.settingsForm.get('newPassword')?.reset();
          this.settingsForm.get('confirmPassword')?.reset();
        } else {
          this.errorMessage = res.message;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to update profile.';
        this.snackBar.open(this.errorMessage, 'OK', { duration: 4000 });
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('slideInLeft', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('slideInRight', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('600ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0)', opacity: 1 })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(30px)', opacity: 0 }),
        animate('500ms 300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query(':enter', [
          style({ transform: 'translateY(20px)', opacity: 0 }),
          stagger('80ms', [
            animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  isSignup = false;
  isVerification = false;
  pendingEmail = '';
  isLoading = false;
  hidePassword = true;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  signupForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  verifyForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  get activeForm(): FormGroup {
    if (this.isVerification) return this.verifyForm;
    return this.isSignup ? this.signupForm : this.loginForm;
  }

  toggleMode(): void {
    if (this.isVerification) {
      this.isVerification = false;
      this.isSignup = false;
    } else {
      this.isSignup = !this.isSignup;
    }
  }

  onSubmit(): void {
    if (this.activeForm.invalid) {
      this.activeForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    // Password match check for signup
    if (this.isSignup && !this.isVerification) {
      const pw = this.signupForm.value.password;
      const cpw = this.signupForm.value.confirmPassword;
      if (pw !== cpw) {
        this.isLoading = false;
        this.snackBar.open('Passwords do not match', 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
        return;
      }
    }

    if (this.isVerification) {
      this.authService.verifyEmail({ email: this.pendingEmail, code: this.verifyForm.value.code }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.snackBar.open('Email verified! You can now log in.', 'OK', { duration: 4000, panelClass: ['success-snackbar'] });
            this.isVerification = false;
            this.isSignup = false;
            this.loginForm.patchValue({ email: this.pendingEmail });
          } else {
            this.snackBar.open(res.message, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Verification failed. Please try again.';
          this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
        },
      });
    } else if (this.isSignup) {
      this.authService.signup({ email: this.signupForm.value.email, password: this.signupForm.value.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.snackBar.open('Account created! Please check your email for the verification code.', 'OK', { duration: 5000, panelClass: ['success-snackbar'] });
            this.isVerification = true;
            this.pendingEmail = this.signupForm.value.email;
          } else {
            this.snackBar.open(res.message, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Signup failed. Please try again.';
          this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
        },
      });
    } else {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.success) {
            this.snackBar.open(`Welcome, ${res.firstName}!`, '🎉', { duration: 3000, panelClass: ['success-snackbar'] });
            this.router.navigate(['/products']);
          } else {
            this.snackBar.open(res.message, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
          }
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err.error?.message || 'Login failed. Please try again.';
          this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: ['error-snackbar'] });
          if (err.status === 403 && msg.includes('verify')) {
            this.pendingEmail = this.loginForm.value.email;
            this.isVerification = true;
          }
        },
      });
    }
  }
}
